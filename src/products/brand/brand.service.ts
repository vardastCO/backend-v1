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
import { UpdateBrandInput } from "./dto/update-brand.input";
import { Brand } from "./entities/brand.entity";


@Injectable()
export class BrandService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createBrandInput: CreateBrandInput, user: User): Promise<Brand> {
    const brand: Brand = Brand.create<Brand>(createBrandInput);

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
    const  take = 10;
    const result =  await Brand.find({
      skip,
      take,
      where: name ? { name: Like(`%${name.replace(" ", "%")}%`) } : {},
      order: { id: "DESC" },
    });

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_MONTH); 
    
    return result
  }

  async paginate(indexBrandInput?: IndexBrandInput): Promise<PaginationBrandResponse> {
    indexBrandInput?.boot();
    const { take, skip, name,hasLogoFile,hasBannerFile,hasCatalogeFile,hasPriceList } = indexBrandInput || {};
  
    const cacheKey = `brands_${JSON.stringify(indexBrandInput)}`;
  
    const cachedData = await this.cacheManager.get<PaginationBrandResponse>(cacheKey);
  
    if (cachedData) {
      cachedData.data.forEach(category => {
        category.createdAt = new Date(category.createdAt);
        category.updatedAt = new Date(category.updatedAt);
      })
      return cachedData;
    }
    const whereConditions: any = {};
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
      whereConditions[`bannerFile`] = indexBrandInput.hasBannerFile ? Not(IsNull()) : IsNull();
    }
    whereConditions[`id`] = Not(12269);
    const [data, total] = await Brand.findAndCount({
      skip,
      take,
      where: whereConditions,
      order: {
        sum: "DESC",
      },
    });

    try {
      const jsonString = JSON.stringify(data).replace(/__bannerFile__/g, 'bannerFile').replace(/__logoFile__/g, 'logoFile')
        .replace(/__catalog__/g, 'catalog').replace(/__priceList__/g, 'priceList')
      ;

      const modifiedDataWithOutText = JSON.parse(jsonString);

      const response = PaginationBrandResponse.make(indexBrandInput, total, modifiedDataWithOutText);
      
      await this.cacheManager.set(cacheKey, response,  CacheTTL.ONE_WEEK);
    
      return response;
    } catch (e) {
      
    }
   
  }
  
  async findOne(id: number, payload?: any): Promise<Brand> {
    try {
      this.logBrandView(id,payload);
      const cacheKey = `brand_${JSON.stringify(id)}`;
  
      const cachedData = await this.cacheManager.get<Brand>(cacheKey);
    
      if (cachedData) {
        cachedData.createdAt = new Date();
        cachedData.updatedAt = new Date();
        const catalogFile = await cachedData.catalog;

        if (catalogFile) {
          // Now you can access the properties of the resolved File object
          const catalogCreatedAt = await catalogFile.createdAt;
        
          if (catalogCreatedAt) {
            (await cachedData.catalog).createdAt = new Date(catalogCreatedAt);
          }
        }

        const priceFile = await cachedData.priceList;

        if (priceFile) {
          // Now you can access the properties of the resolved File object
          const priceCreatedAt = await priceFile.createdAt;
        
          if (priceCreatedAt) {
            (await cachedData.priceList).createdAt = new Date(priceCreatedAt);
          }
        }
      
      
        
      
        // if (cachedData.priceList && cachedData.priceList.createdAt) {
        //   const priceListCreatedAt = await cachedData.priceList.createdAt;
        //   cachedData.priceList.createdAt = new Date(priceListCreatedAt);
        // }
      
        return cachedData
      }
      const brand = await Brand.findOneBy({ id });
      if (!brand) {
        throw new NotFoundException();
      }
      try {
        // const prevousTotal = brand.total;
        // brand.total = await this.getOfferLength(brand.id)
        // if (prevousTotal != brand.total) {
        //   await brand.save();
        // }
        const jsonString = JSON.stringify(brand).replace(/__logoFile__/g, 'logoFile')
        .replace(/__bannerFile__/g, 'bannerFile')
        .replace(/__catalog__/g, 'catalog')
        .replace(/__priceList__/g, 'priceList')
      ;
  
      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);
        await this.cacheManager.set(cacheKey, modifiedDataWithOutText, CacheTTL.ONE_WEEK);
      } catch (e) {
          throw e
      }
      return brand;
        
    } catch (e) {
      throw e
    }
    
  }

  async logBrandView(brandId: number,payload:any): Promise<void> {
    const viewsKey = `brand_views_${brandId}`;
    const views: any[] = (await this.cacheManager.get(viewsKey)) || [];
  
    views.push(payload);
  
    await this.cacheManager.set(viewsKey, JSON.stringify(views));
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
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/brand/logos",
        updateBrandInput.logoFileUuid,
        Brand.name,
        user.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: updateBrandInput.logoFileUuid },
        }),
      );

      delete updateBrandInput.logoFileUuid;

      brand.logoFile = Promise.resolve(file);
    }

    await brand.save();
    return brand;
  }

  async remove(id: number): Promise<Brand> {
    const brand: Brand = await this.findOne(id);
    await brand.remove();
    brand.id = id;
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
