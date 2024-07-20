import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { File } from "src/base/storage/file/entities/file.entity";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Address } from "src/users/address/entities/address.entity";
import { AddressRelatedTypes } from "src/users/address/enums/address-related-types.enum";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { User } from "src/users/user/entities/user.entity";
import { EntityManager, IsNull, Like, Not } from "typeorm";
import * as zlib from "zlib";
import { Product } from "../product/entities/product.entity";
import { CreateBrandInput } from "./dto/create-brand.input";
import { IndexBrandInput } from "./dto/index-brand.input";
import { PaginationBrandResponse } from "./dto/pagination-brand.response";
import { PayloadDto } from "./dto/payload-brand";
import { UpdateBrandInput } from "./dto/update-brand.input";
import { Brand } from "./entities/brand.entity";
import { SortBrandEnum } from "./enum/sort-types.enum";

@Injectable()
export class BrandService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private readonly fileService: FileService,
    private readonly entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private authorizationService: AuthorizationService,
  ) {}

  async create(createBrandInput: CreateBrandInput, user: User): Promise<Brand> {
    const brand: Brand = Brand.create<Brand>(createBrandInput);

    if (createBrandInput.name_fa && createBrandInput.name_en) {
      brand.name = `${createBrandInput.name_fa} (${createBrandInput.name_en})`;
    } else if (createBrandInput.name_fa) {
      brand.name = createBrandInput.name_fa;
    }

    if (createBrandInput.logoFileUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/brand/logos",
        createBrandInput.logoFileUuid,
        Brand.name,
        user.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: createBrandInput.logoFileUuid },
        }),
      );

      delete createBrandInput.logoFileUuid;

      brand.logoFile = Promise.resolve(file);
    }
    brand.sum = 0;
    await brand.save();
    return brand;
  }

  async findAll(indexBrandInput?: IndexBrandInput): Promise<Brand[]> {
    const cacheKey = `find_all_brand_${JSON.stringify(indexBrandInput)}`;

    // Try to get the result from the cache
    // const cachedResult = await this.cacheManager.get<Brand[]>(cacheKey);

    // if (cachedResult) {
    //   // Return the cached result if available
    //   return cachedResult;
    // }
    const { skip, name } = indexBrandInput || {};
    const take = 50;
    const result = await Brand.find({
      skip,
      take,
      where: name ? { name: Like(`%${name.replace(" ", "%")}%`) } : {},
      order: { id: "DESC" },
    });

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

    return result;
  }

  async paginate(
    indexBrandInput?: IndexBrandInput,
    user?: User,
  ): Promise<PaginationBrandResponse> {
    indexBrandInput?.boot();

    const {
      take,
      skip,
      name,
      categoryId,
      hasBannerFile,
      hasCatalogeFile,
      hasPriceList,
    } = indexBrandInput || {};
    let admin = false;
    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      admin = true;
    }
    const cacheKey = `brands_${JSON.stringify(indexBrandInput)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData && !admin) {

      const decompressedData = zlib
        .gunzipSync(Buffer.from(cachedData, "base64"))
        .toString("utf-8");
      const parsedData: PaginationBrandResponse = JSON.parse(decompressedData);
      console.log('with cache,',parsedData)
      return parsedData;
    }

    const whereConditions: any = {};
    const order: any = {};

    switch (indexBrandInput.sortType) {
      case SortBrandEnum.NEWEST:
        order['createdAt'] = "DESC";
        break;
      case SortBrandEnum.RATING:
        order['rating'] = "DESC";
        break;
      case SortBrandEnum.VIEW:
          order['views'] = "DESC";
          break;
      default:
        order['sum'] = "DESC";
        break;
    }

    if (name) {
      whereConditions[`name`] = Like(`%${name}%`);
    }

    if (categoryId) {
      whereConditions[`categoryId`] = categoryId;
    }

    if (indexBrandInput.hasLogoFile !== undefined) {
      whereConditions[`logoFile`] = indexBrandInput.hasLogoFile
        ? Not(IsNull())
        : IsNull();
    }

    if (indexBrandInput.hasCatalogeFile !== undefined) {
      whereConditions[`catalog`] = indexBrandInput.hasCatalogeFile
        ? Not(IsNull())
        : IsNull();
    }

    if (indexBrandInput.hasPriceList !== undefined) {
      whereConditions[`priceList`] = indexBrandInput.hasPriceList
        ? Not(IsNull())
        : IsNull();
    }

    if (indexBrandInput.hasBannerFile !== undefined) {
      whereConditions[`bannerDesktop`] = indexBrandInput.hasBannerFile
        ? Not(IsNull())
        : IsNull();
    }
    console.log('whereConditions,',whereConditions)
    whereConditions[`id`] = Not(12269);
    const [data, total] = await Brand.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: order
    });
    console.log('total,',total)
    try {
      const jsonString = JSON.stringify(data)
        .replace(/__bannerDesktop__/g, "bannerDesktop")
        .replace(/__bannerMobile__/g, "bannerMobile")
        .replace(/__bannerFile__/g, "bannerFile")
        .replace(/__logoFile__/g, "logoFile")
        .replace(/__catalog__/g, "catalog")
        .replace(/__priceList__/g, "priceList");
      const modifiedDataWithOutText = JSON.parse(jsonString);

      const response = PaginationBrandResponse.make(
        indexBrandInput,
        total,
        modifiedDataWithOutText,
      );
      if (!admin) {
        const compressedData = zlib.gzipSync(JSON.stringify(response));
        await this.cacheManager.set(
          cacheKey,
          compressedData,
          CacheTTL.ONE_WEEK,
        );
      }

      return response;
    } catch (e) {}
  }
  private async processFile(filePromise: Promise<any> | undefined) {
    try {
      if (filePromise) {
        const file = await filePromise;
        if (file && file.createdAt) {
          file.createdAt = new Date(file.createdAt);
        }
      }
    } catch (e) {
      console.log('err in processFile ',e)
    }
   
  }
  private async incrementBrandViews(brand: Brand) {
    try {
      await this.entityManager.query(
        `UPDATE product_brands SET views = views + 1 WHERE id = $1`,
        [brand.id]
      );
    } catch (error) {
      console.log('err in incrementBrandViews',error)
    }
  }
  async findOne(id: number): Promise<Brand> {
    try {
      const cacheKey = `brand_${JSON.stringify(id)}`;

      const cachedData = await this.cacheManager.get<string>(cacheKey);

      if (cachedData) {
        const decompressedData = zlib
          .gunzipSync(Buffer.from(cachedData, "base64"))
          .toString("utf-8");
        const parsedData: Brand = JSON.parse(decompressedData);
        parsedData.createdAt = new Date();
        parsedData.updatedAt = new Date();
        await Promise.all([
          this.processFile(parsedData.catalog),
          this.processFile(parsedData.priceList),
          this.processFile(parsedData.bannerDesktop),
          this.processFile(parsedData.logoFile),
          this.incrementBrandViews(parsedData)
        ]);
        return parsedData;
      }
      const query = `
      SELECT "id",name,name_en,name_fa,status,id,sum,views,slug,bio,"createdAt","updatedAt",
      "bannerDesktopId","bannerMobileId","priceListId","catalogId","bannerFileId","logoFileId"
      FROM product_brands 
      WHERE "id" = $1 
      `;
      const brandsql = await this.entityManager.query(query, [id]);

      if (!brandsql) {
        throw new NotFoundException();
      }
      const brand = brandsql[0];
      try {
        const [bannerDesktop,bannerMobile, priceList, catalog,logo, bannerFile] =
          await Promise.all([
            this.fetchFile(brand.bannerDesktopId),
            this.fetchFile(brand.bannerMobileId),
            this.fetchFile(brand.priceListId),
            this.fetchFile(brand.catalogId),
            this.fetchFile(brand.logoFileId),
            this.fetchFile(brand.bannerFileId),
            this.incrementBrandViews(brand)
   
          ]);
        brand.bannerDesktop = bannerDesktop;
        brand.bannerMobile = bannerMobile;
        brand.priceList = priceList;
        brand.catalog = catalog;
        brand.logoFile = logo;
        brand.bannerFile = bannerFile;

        const compressedData = zlib.gzipSync(JSON.stringify(brand));
        await this.cacheManager.set(
          cacheKey,
          compressedData,
          CacheTTL.ONE_WEEK,
        );
        return brand;
      } catch (e) {
        console.log('err in find one brand ',e)
      }

    } catch (e) {
      console.log('err in find one brand out',e)
    }
  }
  async fetchFile(id) {
    return id ? await File.findOneBy({ id }) : null;
  }
  async logBrandView(brandId: number, payload: PayloadDto): Promise<void> {
    try {
      const viewsKey = `brand_views_${brandId}`;

      const views: any[] = (await this.cacheManager.get(viewsKey)) || [];

      views.push(payload);

      await this.cacheManager.set(viewsKey, views);
    } catch (e) {
      console.log("logBrandView", e);
    }
  }

  async getBrandViewCount(brandId: number): Promise<number> {
    const index = "brand_views";

    const query = {
      query: {
        term: { brandId },
      },
    };
    const baseURL = "http://elasticsearch:9200";
    const url = `${baseURL}/${index}/_search`;

    try {
      const response = await axios.post(url, query);
      const count = response.data.hits.total.value;
      return count;
    } catch (error) {
      console.error("Error retrieving brand view count:", error.message);
      // Handle error as needed
      return 0;
    }
  }

  async update(
    id: number,
    updateBrandInput: UpdateBrandInput,
    user: User,
  ): Promise<Brand> {
    const brand: Brand = await Brand.preload({
      id,
      ...updateBrandInput,
    });
    if (updateBrandInput.name_fa && updateBrandInput.name_en) {
      brand.name = `${updateBrandInput.name_fa} (${updateBrandInput.name_en})`;
    } else if (updateBrandInput.name_fa) {
      brand.name = updateBrandInput.name_fa;
    }
    if (!brand) {
      throw new NotFoundException();
    }

    // delete cache
    const cacheKey = `brand_${JSON.stringify(id)}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }

    if (updateBrandInput.logoFileUuid) {
      // const file = await this.fileService.getNewlyUploadedFileOrFail(
      //   "product/brand/logos",
      //   updateBrandInput.logoFileUuid,
      //   Brand.name,
      //   user.id,
      //   await this.i18n.translate("product.image.file_not_found", {
      //     args: { uuid: updateBrandInput.logoFileUuid },
      //   }),
      // );
      const file = await File.findOneBy({
        uuid: updateBrandInput.logoFileUuid,
      });

      delete updateBrandInput.logoFileUuid;
      if (file) {
        brand.logoFile = Promise.resolve(file);
      }
    }

    await brand.save();
    return brand;
  }

  async remove(id: number): Promise<Brand> {
    const brand: Brand = await Brand.findOneBy({ id });
    await brand.remove();
    brand.id = id;
    return brand;
  }

  async removeBrandFile(id: number, fileId: number): Promise<Brand> {
    const brand: Brand = await Brand.findOneBy({ id });
    const bannerFile = await brand.bannerFile;
    const logoFile = await brand.logoFile;
    const bannerDesktop = await brand.bannerDesktop;

    if (bannerFile?.id === fileId) {
      brand.bannerFile = null;
    }
    if (bannerDesktop?.id === fileId) {
      brand.bannerDesktop = null;
    } else if (logoFile?.id === fileId) {
      brand.logoFile = null;
    } else {
      throw new Error(`File with id ${fileId} not found in the brand's files`);
    }
    await brand.save();
    return brand;
  }

  async getProductsOf(brand: Brand): Promise<Product[]> {
    return await brand.products;
  }

  async getContactInfosOf(brand: Brand): Promise<ContactInfo[]> {
    const cacheKey = `contactInfos:${brand.id}:brand`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData as ContactInfo[];
    }

    const contactInfos = await ContactInfo.createQueryBuilder()
      .limit(10)
      .where({
        relatedType: ContactInfoRelatedTypes.BRAND,
        relatedId: brand.id,
      })
      .orderBy({ sort: "ASC" })
      .getMany();

    await this.cacheManager.set(cacheKey, contactInfos,CacheTTL.ONE_WEEK);

    return contactInfos;
  }

  async getAddressesOf(brand: Brand): Promise<Address[]> {
    const cacheKey = `addresses:${brand.id}:brand`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData as Address[];
    }

    const addresses = await Address.createQueryBuilder()
      .limit(10)
      .where({ relatedType: AddressRelatedTypes.BRAND, relatedId: brand.id })
      .orderBy({ sort: "ASC" })
      .getMany();

    await this.cacheManager.set(cacheKey, addresses,CacheTTL.ONE_WEEK);

    return addresses;
  }
  async getOfferLength(id): Promise<number> {
    const products = await Product.findBy({ brandId: id });
    return products.length;
  }
}
