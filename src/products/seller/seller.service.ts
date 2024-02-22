import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { KavenegarService } from "src/base/kavenegar/kavenegar.service";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { Address } from "src/users/address/entities/address.entity";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { Role } from "src/users/authorization/role/entities/role.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "src/users/contact-info/enums/contact-info-related-types.enum";
import { User } from "src/users/user/entities/user.entity";
import { UserService } from "src/users/user/user.service";
import { EntityManager, In, Like } from "typeorm";
import { PaginationBrandResponse } from "../brand/dto/pagination-brand.response";
import { Brand } from "../brand/entities/brand.entity";
import { Offer } from "../offer/entities/offer.entity";
import { Product } from "../product/entities/product.entity";
import { BecomeASellerInput } from "./dto/become-a-seller.input";
import { CreateSellerInput } from "./dto/create-seller.input";
import { IndexSellerBrandInput } from "./dto/index-seller-brand.input";
import { IndexSellerInput } from "./dto/index-seller.input";
import { PaginationSellerResponse } from "./dto/pagination-seller.response";
import { UpdateSellerInput } from "./dto/update-seller.input";
import { SellerRepresentative } from "./entities/seller-representative.entity";
import { Seller } from "./entities/seller.entity";
import { SellerRepresentativeRoles } from "./enums/seller-representative-roles.enum";

@Injectable()
export class SellerService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private readonly fileService: FileService,
    private authorizationModule: AuthorizationService,
    private readonly kavenegarService: KavenegarService,
    private readonly authorizationService: AuthorizationService,
    private readonly userService: UserService,
    private readonly entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(
    createSellerInput: CreateSellerInput,
    user: User,
  ): Promise<Seller> {
    if (!createSellerInput.status) {
      delete createSellerInput.status;
    }
    if (!createSellerInput.isPublic) {
      delete createSellerInput.isPublic;
    }
    const seller: Seller = Seller.create<Seller>({
      createdById: user.id,
      ...createSellerInput,
    });

    if (createSellerInput.logoFileUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/seller/logos",
        createSellerInput.logoFileUuid,
        Seller.name,
        user.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: createSellerInput.logoFileUuid },
        }),
      );

      seller.logoFile = Promise.resolve(file);
    }

    await seller.save();
    return seller;
  }

  async sellerCount(): Promise<number> {
    const sellerCount: number = await Seller.count();
    return sellerCount;
  }

  async findAll(
    user: User,
    indexSellerInput?: IndexSellerInput,
  ): Promise<Seller[]> {


    const cacheKey = `find_all_seller_${JSON.stringify(indexSellerInput)}`;

    // Try to get the result from the cache
    const cachedResult = await this.cacheManager.get<Seller[]>(cacheKey);
  
    if (cachedResult) {
      // Return the cached result if available
      // return cachedResult;
    }

    try {
      const queryBuilder = Seller.createQueryBuilder()
      if (indexSellerInput.name) {
        queryBuilder.andWhere("name ILIKE :query", { query: `%${indexSellerInput.name}%` });
      }
      
      const result = await queryBuilder
      .select([`${queryBuilder.alias}.id`, `${queryBuilder.alias}.name`])
        .limit(10)
      .getMany();
      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK); // Set TTL as needed

      return result;
    } catch (error) {
      // Handle error appropriately (e.g., log it, throw a custom error)
      console.error("Error fetching categories:", error);
    }
    // const { take, skip, isPublic, status, createdById } =
    //   indexSellerInput || {};
    // const where = (await this.authorizationModule
    //   .setUser(user)
    //   .hasPermission("gql.products.seller.index"))
    //   ? { isPublic, status, createdById }
    //   : {
    //       status: ThreeStateSupervisionStatuses.CONFIRMED,
    //       isPublic: true,
    //     };
    // const queryBuilder = Seller.createQueryBuilder("seller").where(where);
    // let cityId = indexSellerInput.cityId;
    // if (cityId) {
    //   // Use a subquery to filter based on the cityId in the Address entity
    //   queryBuilder
    //     .innerJoin("seller.addresses", "address")
    //     .where("address.cityId = :cityId", { cityId });
    // }

    // // Apply additional conditions and order
    // // queryBuilder.andWhere(where);
    // queryBuilder.take(25).orderBy("seller.id", indexSellerInput.sort ?? "ASC");

    // // Execute the query and return the result
    // return await queryBuilder.getMany();
    // // return await Seller.find({
    // //   skip,
    // //   take,
    // //   order: { id: "DESC" },
    // //   where,
    // // });
  }

  async paginate(
    user: User,
    indexSellerInput?: IndexSellerInput,
  ): Promise<PaginationSellerResponse> {
    indexSellerInput.boot();
    const { take, skip, isPublic, status, createdById, name } =
      indexSellerInput || {};

    const cacheKey = `sellers_${JSON.stringify(indexSellerInput)}`;
    const cachedData = await this.cacheManager.get<PaginationSellerResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // const where = (await this.authorizationModule
    //   .setUser(user)
    //   .hasPermission("gql.products.seller.index"))
    //   ? { isPublic, status, createdById }
    //   : {
    //       status: ThreeStateSupervisionStatuses.CONFIRMED,
    //       isPublic: true,
    //     } 
    const whereConditions: any = {};
    if (name) {
      whereConditions[`name`] = Like(`%${name}%`);
    }
    

    const [data, total] = await Seller.findAndCount({
      skip,
      take,
      where : whereConditions,
      order: {
        rating: "DESC",
      },
      // relations: [ 'brands'], 
    });


    try {
      const modifiedData = await Promise.all(
        data.map(async seller => {
          // seller.offers =  []
          seller.brands = []
          // seller.sum = await this.getOfferLength(seller.id);
          return seller;
        }),
      );

      const jsonString = JSON.stringify(modifiedData).replace(/__bannerFile__/g, 'bannerFile')
        .replace(/__logoFile__/g, 'logoFile')
        .replace(/__offers__/g, 'offers')
        .replace(/__has_offers__/g, 'has_offers');

      
      // Parse the modified JSON back to objects
      const result = JSON.parse(jsonString);
      const response = PaginationSellerResponse.make(
        indexSellerInput,
        total,
        result,
      );

      await this.cacheManager.set(cacheKey, response, CacheTTL.ONE_WEEK);//one week ?

      return response;
    } catch (e) {}

  }

  async findLastSellerOffer(sellerId: number): Promise<Offer[]> {
    const lastOffer = await Offer.findOne({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  
    return lastOffer ? [lastOffer] : [];
  }
  
  async findOne(id: number): Promise<Seller> {
    try {
      this.logSellerView(id);
      const cacheKey = `seller_${JSON.stringify(id)}`;
  
      const cachedData = await this.cacheManager.get<Seller>(cacheKey);
    
      if (cachedData) {
        return cachedData;
      }
      const seller = await Seller.findOne({
        where: { id: id },
        relations: ['representatives'],
      });
      if (!seller) {
        throw new NotFoundException();
      }
      try {
        seller.contacts = await seller.contacts;
        seller.addresses = await seller.addresses;
        // const previousTotla = seller.total;
        // seller.total = await this.getOfferLength(seller.id);
        // if (previousTotla != seller.total) {
        //   await seller.save();
        // }
        const jsonString = JSON.stringify(seller).replace(/__logoFile__/g, 'logoFile')
          .replace(/__bannerFile__/g, 'bannerFile')
          .replace(/__representatives__/g, 'representatives')

      ;
  
      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);
        await this.cacheManager.set(cacheKey, modifiedDataWithOutText, CacheTTL.ONE_WEEK);
      

      } catch (e) {
        throw e
      }
      
      return seller;

    } catch (e) {
      throw e
    }
   
  }

  async logSellerView(sellerId: number): Promise<void> {
    const viewsKey = `seller_views_${sellerId}`;
    const views: any[] = (await this.cacheManager.get(viewsKey)) || [];

    views.push({ timestamp: new Date().toISOString() });

    await this.cacheManager.set(viewsKey, views);
  }

  async getSellerViewCount(sellerId: number): Promise<number> {
    const index = 'seller_views';

    const query = {
      query: {
        term: { sellerId },
      },
    };
    const baseURL = 'http://elasticsearch:9200';
    const url = `${baseURL}/${index}/_search`;

    try {
      const response = await axios.post(url, query);
      const count = response.data.hits.total.value;
      return count;
    } catch (error) {
      console.error('Error retrieving seller view count:', error.message);
      // Handle error as needed
      return 0;
    }
  }

  async update(
    id: number,
    updateSellerInput: UpdateSellerInput,
    user: User,
  ): Promise<Seller> {
    const seller: Seller = await Seller.findOneBy({ id });
    if (!seller) {
      throw new NotFoundException();
    }

    
    // delete cache
    const cacheKey = `seller_${JSON.stringify(id)}`
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }

    const originalSeller = { ...seller };
    Object.assign(seller, updateSellerInput);

    if (updateSellerInput.logoFileUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/seller/logos",
        updateSellerInput.logoFileUuid,
        Seller.name,
        user.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: updateSellerInput.logoFileUuid },
        }),
      );

      delete updateSellerInput.logoFileUuid;

      seller.logoFile = Promise.resolve(file);
      // seller.bannerFile = Promise.resolve(file);
    }

    await seller.save();
    if (
      originalSeller.status == ThreeStateSupervisionStatuses.PENDING &&
      updateSellerInput.status == ThreeStateSupervisionStatuses.CONFIRMED
    ) {
      for (const rep of await seller.representatives) {
        const repUser = await rep.user;
        if (
          await this.authorizationService.setUser(repUser).hasRole("seller")
        ) {
          continue;
        }

        const repUserRoles = await repUser.roles;
        repUserRoles.push(await Role.findOneBy({ name: "seller" }));
        repUser.roles = Promise.resolve(repUserRoles);

        await repUser.save();
        await this.kavenegarService.lookup(
          repUser.cellphone,
          "becameASeller",
          "کاربر",
        );
      }
    }
    return seller;
  }

  async remove(id: number): Promise<Seller> {
    const seller: Seller = await this.findOne(id);
    await seller.remove();
    seller.id = id;
    return seller;
  }

  async getContactInfosOf(seller: Seller): Promise<ContactInfo[]> {
    return ContactInfo.createQueryBuilder()
      .limit(10)
      .where({
        relatedType: ContactInfoRelatedTypes.SELLER,
        relatedId: seller.id,
      })
      .orderBy({ sort: "ASC" })
      .getMany();
  }

  async getAddressesOf(seller: Seller): Promise<Address[]> {
    return Address.createQueryBuilder()
      .limit(10)
      .where({ relatedType: Seller.name, relatedId: seller.id })
      .orderBy({ sort: "ASC" })
      .getMany();
  }

  async getBrandsOfSeller(
    indexSellerBrandInput: IndexSellerBrandInput,
  ): Promise<PaginationBrandResponse> {
    indexSellerBrandInput?.boot();
    const { take, skip, sellerId } = indexSellerBrandInput || {};
    const queryBuilder = Product.createQueryBuilder();
    const cacheKey = `brand_of_seller_${JSON.stringify(indexSellerBrandInput)}`;
    const cachedData = await this.cacheManager.get<PaginationBrandResponse>(
      cacheKey,
    );

    if (cachedData) {
      return cachedData;
    }

    const products = await queryBuilder
      .innerJoinAndSelect(`${queryBuilder.alias}.offers`, "offer")
      .where("offer.sellerId = :sellerId", { sellerId })
      .getMany();
    
    const uniqueBrandIds = [
      ...new Set(
        await Promise.all(
          products.map(async product => product.brandId),
        ),
      ),
    ];

    const [data, sum] = await Brand.findAndCount({
      skip,
      take,
      where: {id: In(uniqueBrandIds)}
    });


    const jsonString = JSON.stringify(data)
      .replace(/__bannerFile__/g, "bannerFile")
      .replace(/__logoFile__/g, "logoFile");
    
    
    // Parse the modified JSON back to objects
    const modifiedDataWithOutText = JSON.parse(jsonString);
    
    const response = PaginationBrandResponse.make(
      indexSellerBrandInput,
      sum,
      modifiedDataWithOutText,
    );

    await this.cacheManager.set(cacheKey, response, CacheTTL.ONE_WEEK); //one week ?

    return response;
  }

  async getBrandLength(id): Promise<number> {
    // const count = await Product.count({ where: { brandId: id } });
    const query = `
      SELECT COUNT(*) AS count
      FROM products p
      WHERE p."brandId"  = $1;`
    const result = await this.entityManager.query(query, [id]);
    const count = parseInt(result[0].count, 10);
    return count;
  }

  async getOfferLength(id:number): Promise<number> {
    const query = `
      select count(*) as offer_length
      from product_offers p 
      where "sellerId" = $1
    `
    const result = await this.entityManager.query(query, [id]);
    const count = parseInt(result[0].offer_length, 10);
    return count;
  }

  async getOfferBrand(id): Promise<Brand[]> {
    const seller = await Seller.findOneBy({ id: id });
    const offers = await seller.offers; 

    const brands = await Promise.all(offers.map(async (offer) => {
      const product = await offer.product;
      return product?.brandId;
    }));

    const uniqueBrandIds = brands.filter((brand) => brand !== undefined) as number[];

    const result =  await Brand.findBy({
      id: In(uniqueBrandIds)
    });


    // const query = `
    //   select distinct * 
    //   from product_brands pb 
    //   where pb."id" in (
    //     SELECT distinct p."brandId" 
    //     FROM products p
    //     WHERE p."id" IN (
    //         SELECT "productId" 
    //         FROM product_offers po 
    //         WHERE "sellerId" = $1
    //     )
    //   )
    // `

    // const res = await this.entityManager.query(query, [id]);
    return result
  }

  /**
   * User Access Level
   */
  async becomeASeller(
    becomeASellerInput: BecomeASellerInput,
    user: User,
  ): Promise<Seller> {
    if (await this.userService.getSellerRecordOf(user)) {
      throw new BadRequestException(
        "شما قبلا درخواست ارتقاء حساب کاربری به فروشنده را ارسال نموده‌اید.",
      );
    }

    const seller: Seller = Seller.create<Seller>({
      createdById: user.id,
      ...becomeASellerInput,
    });

    if (becomeASellerInput.logoFileUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/seller/logos",
        becomeASellerInput.logoFileUuid,
        Seller.name,
        user.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: becomeASellerInput.logoFileUuid },
        }),
      );

      seller.logoFile = Promise.resolve(file);
      user.avatarFile = Promise.resolve(file);
      
      
      
    }

    user.fullName = becomeASellerInput.name;

    const repUserRoles = await user.roles;
    repUserRoles.push(await Role.findOneBy({ name: "seller" }));
    user.roles = Promise.resolve(repUserRoles);

    await seller.save();
    await user.save();

    // Create Seller Rep
    const rep = SellerRepresentative.create({
      sellerId: seller.id,
      userId: user.id,
      role: SellerRepresentativeRoles.ADMIN,
      isActive: true,
      createdById: user.id,
    });
    await rep.save();

    await this.kavenegarService.lookup(
      user.cellphone,
      "becomeASellerRequest",
      "کاربر",
    );

    return seller;
  }
}
