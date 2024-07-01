import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Address } from "src/users/address/entities/address.entity";
import { AddressRelatedTypes } from "src/users/address/enums/address-related-types.enum";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { User } from "src/users/user/entities/user.entity";
import { IsNull, Like, Not } from "typeorm";
import { Product } from "../product/entities/product.entity";
import { CreateBrandInput } from "./dto/create-brand.input";
import { IndexBrandInput } from "./dto/index-brand.input";
import { PaginationBrandResponse } from "./dto/pagination-brand.response";
import { PayloadDto } from "./dto/payload-brand";
import { UpdateBrandInput } from "./dto/update-brand.input";
import { Brand } from "./entities/brand.entity";
import { SortBrandEnum } from "./enum/sort-types.enum";
import * as zlib from 'zlib';
import { File } from "src/base/storage/file/entities/file.entity";
import { AuthorizationService } from "src/users/authorization/authorization.service";


@Injectable()
export class BrandService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private readonly fileService: FileService,
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
    brand.sum = 0
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
    const {  skip, name } = indexBrandInput || {};
    const  take = 50;
    const result =  await Brand.find({
      skip,
      take,
      where: name ? { name: Like(`%${name.replace(" ", "%")}%`) } : {},
      order: { id: "DESC" },
    });

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_MONTH); 
    
    return result
  }

  async paginate(indexBrandInput?: IndexBrandInput,user?: User): Promise<PaginationBrandResponse> {
    
    indexBrandInput?.boot();
    
    const { take, skip, name, hasLogoFile, hasBannerFile, hasCatalogeFile, hasPriceList } = indexBrandInput || {};
    let admin = false
    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      admin = true
    }
    const cacheKey = `brands_${JSON.stringify(indexBrandInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData && !admin) {
      // cachedData.data.forEach(category => {
      //   category.createdAt = new Date(category.createdAt);
      //   category.updatedAt = new Date(category.updatedAt);
      // })
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: PaginationBrandResponse = JSON.parse(decompressedData);

      return parsedData;

    }

    const whereConditions: any = {};
    const order: any = {}

    switch (indexBrandInput.sortType) {
      case SortBrandEnum.NEWEST:
        order['createdAt'] = "DESC";
        break;
      case SortBrandEnum.RATING:
        order['rating'] = "DESC";
        break;
      default:
        order['sum'] = "DESC";
        break;
    }
    
    
    if (name) {
      whereConditions[`name`] = Like(`%${name}%`);
    }
    
    if (indexBrandInput.hasLogoFile !== undefined) {
      whereConditions[`logoFile`] = indexBrandInput.hasLogoFile ? Not(IsNull()) : IsNull();
    }
    
    if (indexBrandInput.hasCatalogeFile !== undefined) {
      whereConditions[`catalog`] = indexBrandInput.hasCatalogeFile ? Not(IsNull()) : IsNull();
    }
    
    if (indexBrandInput.hasPriceList !== undefined) {
      whereConditions[`priceList`] = indexBrandInput.hasPriceList ? Not(IsNull()) : IsNull();
    }
    
    if (indexBrandInput.hasBannerFile !== undefined) {
      whereConditions[`bannerDesktop`] = indexBrandInput.hasBannerFile ? Not(IsNull()) : IsNull();
    }
    whereConditions[`id`] = Not(12269);
    const [data, total] = await Brand.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: order,
    });

    try {
      const jsonString = JSON.stringify(data).replace(/__bannerDesktop__/g, 'bannerDesktop').replace(/__bannerFile__/g, 'bannerFile').replace(/__logoFile__/g, 'logoFile')
        .replace(/__catalog__/g, 'catalog').replace(/__priceList__/g, 'priceList')
      ;

      const modifiedDataWithOutText = JSON.parse(jsonString);

      const response = PaginationBrandResponse.make(indexBrandInput, total, modifiedDataWithOutText);
      if (!admin) {
        const compressedData = zlib.gzipSync(JSON.stringify(response));
        await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);
      }

      return response;
    } catch (e) {
      
    }
   
  }
  
  async findOne(id: number, payload?: PayloadDto): Promise<Brand> {
    try {
      // this.logBrandView(id,payload);
      const cacheKey = `brand_${JSON.stringify(id)}`;
  
      const cachedData = await this.cacheManager.get<string>(cacheKey);
    
      if (cachedData) {
        const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
        const parsedData: Brand = JSON.parse(decompressedData);
        parsedData.createdAt = new Date();
        parsedData.updatedAt = new Date();
        const catalogFile = await parsedData.catalog;
        if (catalogFile) {
         
          (await parsedData.catalog).createdAt = new Date(catalogFile.createdAt);
          
        }

        const priceFile = await parsedData.priceList;

        if (priceFile) {
          // Now you can access the properties of the resolved File object
          const priceCreatedAt = await priceFile.createdAt;
        
          if (priceCreatedAt) {
            (await parsedData.priceList).createdAt = new Date(priceCreatedAt);
          }
        }
        const desktopBannerFile = await parsedData.bannerDesktop;
        if (desktopBannerFile) {
          const desktopBannerFileCreatedAt = await desktopBannerFile.createdAt;
        
          if (desktopBannerFileCreatedAt) {
            (await parsedData.bannerDesktop).createdAt = new Date(desktopBannerFileCreatedAt);
          }
        }
      
        return parsedData
      }
      const brand = await Brand.findOneBy({ id });
      if (!brand) {
        throw new NotFoundException();
      }
      try {
        const jsonString = JSON.stringify(brand).replace(/__logoFile__/g, 'logoFile')
        .replace(/__bannerFile__/g, 'bannerFile')
        .replace(/__catalog__/g, 'catalog')
        .replace(/__bannerDesktop__/g, 'bannerDesktop')
        .replace(/__priceList__/g, 'priceList')
      ;
  
        const modifiedDataWithOutText = JSON.parse(jsonString);
        const compressedData = zlib.gzipSync(JSON.stringify(modifiedDataWithOutText));
        await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_WEEK);
      } catch (e) {
          throw e
      }
      return brand;
        
    } catch (e) {
      throw e
    }
    
  }

  async logBrandView(brandId: number, payload: PayloadDto): Promise<void> {
    try {
      const viewsKey = `brand_views_${brandId}`;

      const views: any[] = (await this.cacheManager.get(viewsKey)) || [];
  
      views.push(payload);

      await this.cacheManager.set(viewsKey, views);
      
    } catch (e) {
     console.log('logBrandView',e) 
    }
 
  }

  async getBrandViewCount(brandId: number): Promise<number> {
    const index = 'brand_views';

    const query = {
      query: {
        term: { brandId },
      },
    };
    const baseURL = 'http://elasticsearch:9200';
    const url = `${baseURL}/${index}/_search`;

    try {
      const response = await axios.post(url, query);
      const count = response.data.hits.total.value;
      return count;
    } catch (error) {
      console.error('Error retrieving brand view count:', error.message);
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
      const file = await  File.findOneBy({
        uuid : updateBrandInput.logoFileUuid
      })

      delete updateBrandInput.logoFileUuid;
      if (file) {
        brand.logoFile = Promise.resolve(file);
      }

   
    }

    await brand.save();
    return brand;
  }

  async remove(id: number): Promise<Brand> {
    const brand: Brand = await Brand.findOneBy({id});
    await brand.remove();
    brand.id = id;
    return brand;
  }

  async removeBrandFile(id: number,fileId:number): Promise<Brand> {
    const brand: Brand = await Brand.findOneBy({id});
    const bannerFile = await brand.bannerFile;
    const logoFile = await brand.logoFile;
    const bannerDesktop = await brand.bannerDesktop;

    if (bannerFile?.id === fileId) {
        brand.bannerFile = null;
    }
    if (bannerDesktop?.id === fileId) {
      brand.bannerDesktop = null;
    }
    else if (logoFile?.id === fileId) {
        brand.logoFile = null;
    }
    else {
        throw new Error(`File with id ${fileId} not found in the brand's files`);
    }
    await brand.save();
    return brand;
  }

  async getProductsOf(brand: Brand): Promise<Product[]> {
    return await brand.products;
  }

  async getContactInfosOf(brand: Brand): Promise<ContactInfo[]> {
    return ContactInfo.createQueryBuilder()
      .limit(10)
      .where({
        relatedType: ContactInfoRelatedTypes.BRAND,
        relatedId: brand.id,
      })
      .orderBy({ sort: "ASC" })
      .getMany();
  }

  async getAddressesOf(brand: Brand): Promise<Address[]> {
    return Address.createQueryBuilder()
      .limit(10)
      .where({ relatedType: AddressRelatedTypes.BRAND, relatedId: brand.id })
      .orderBy({ sort: "ASC" })
      .getMany();
  }
  async getOfferLength(id): Promise<number> {
    const products = await Product.findBy({ brandId :id});
    return products.length;
  }
}
