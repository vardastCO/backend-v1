import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { User } from "src/users/user/entities/user.entity";
import { UserService } from "src/users/user/user.service";
import { DataSource, EntityManager, In } from "typeorm";
import { File } from "../../base/storage/file/entities/file.entity";
import { AuthorizationService } from "../../users/authorization/authorization.service";
import { LastPrice } from "../price/entities/last-price.entity";
import { Price } from "../price/entities/price.entity";
import { Product } from "../product/entities/product.entity";
import { PaginationSellerResponse } from "../seller/dto/pagination-seller.response";
import { Seller } from "../seller/entities/seller.entity";
import { CreateOfferInput } from "./dto/create-offer.input";
import { IndexTakeBrandToSeller } from "./dto/index-brand-seller.input";
import { IndexOfferInput } from "./dto/index-offer.input";
import { PaginationOfferResponse } from "./dto/pagination-offer.response";
import { UpdateOfferInput } from "./dto/update-offer.input";
import { Offer } from "./entities/offer.entity";

@Injectable()
export class OfferService {
  constructor(
    private authorizationService: AuthorizationService,
    private userService: UserService,
    private readonly entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async create(createOfferInput: CreateOfferInput, user: User): Promise<Offer> {
    const hasMasterPermission = await this.authorizationService
      .setUser(user)
      .hasPermission("gql.products.offer.store");

    if (!hasMasterPermission) {
      createOfferInput.sellerId = (
        await this.userService.getSellerRecordOf(user)
      )?.id;
      createOfferInput.status = ThreeStateSupervisionStatuses.PENDING;
    } else {
      createOfferInput.sellerId =
        createOfferInput.sellerId ??
        (await this.userService.getSellerRecordOf(user))?.id;
    }

    const sellerExists = await Seller.createQueryBuilder()
      .where({ id: createOfferInput.sellerId })
      .getExists();
    const productExists = await Product.createQueryBuilder()
      .where({ id: createOfferInput.productId })
      .getExists();
    if (!sellerExists || !productExists) {
      throw new BadRequestException("the product is exist in Offer list");
    }
    const offer: Offer = Offer.create<Offer>(createOfferInput);
    try {
      await offer.save();
    } catch (e) {
      throw new BadRequestException("the product is exist in Offer list");
    }
 
    return offer;
  }

  async findAll(
    user: User,
    indexOfferInput?: IndexOfferInput,
  ): Promise<Offer[]> {
    const hasMasterPermission = await this.authorizationService
      .setUser(user)
      .hasPermission("gql.products.offer.index");

    const { take, skip, productId, isPublic, isAvailable, status } =
      indexOfferInput || {};
    let { sellerId } = indexOfferInput || {};

    if (!hasMasterPermission) {
      sellerId = (await this.userService.getSellerRecordOf(user))?.id;
    }

    return await Offer.find({
      skip,
      take,
      where: { sellerId, productId, isPublic, isAvailable, status },
      order: { id: "DESC" },
    });
  }

  async paginate(
    user: User,
    indexOfferInput?: IndexOfferInput,
  ): Promise<PaginationOfferResponse> {
    indexOfferInput.boot();
    const hasMasterPermission = await this.authorizationService
      .setUser(user)
      .hasPermission("gql.products.offer.index");

    const { take, skip, productId, isPublic, isAvailable, status } =
      indexOfferInput || {};
    let { sellerId } = indexOfferInput || {};

    if (!hasMasterPermission) {
      sellerId = (await this.userService.getSellerRecordOf(user))?.id;
    }
    const [data, total] = await Offer.findAndCount({
      skip,
      take,
      where: { sellerId, productId, isPublic, isAvailable, status },
      order: { id: "DESC" },
    });

    return PaginationOfferResponse.make(indexOfferInput, total, data);
  }

  async findOne(id: number, user: User): Promise<Offer> {
    const hasMasterPermission = await this.authorizationService
      .setUser(user)
      .hasPermission("gql.products.offer.show");

    let sellerId: number;
    if (!hasMasterPermission) {
      sellerId = (await this.userService.getSellerRecordOf(user))?.id;
    }

    const offer = await Offer.findOneBy({ id, sellerId });
    if (!offer) {
      throw new NotFoundException();
    }
    return offer;
  }

  async update(
    id: number,
    updateOfferInput: UpdateOfferInput,
    user: User,
  ): Promise<Offer> {
    // const hasMasterPermission = await this.authorizationService
    //   .setUser(user)
    //   .hasPermission("gql.products.offer.update");

    let sellerId: number;
    // if (!hasMasterPermission) {
    //   sellerId = (await this.userService.getSellerRecordOf(user))?.id;
    // }

    const offer: Offer = await Offer.preload({
      id,
      ...updateOfferInput,
    });
    // if ((!hasMasterPermission && offer.sellerId != sellerId) || !offer) {
    //   throw new NotFoundException();
    // }
    await offer.save();
    return offer;
  }

  async remove(productId: number, user: User, offerId: number): Promise<boolean> {
    try {
      const sellerId = (await this.userService.getSellerRecordOf(user))?.id;
      let offer: Offer;

      const cacheKey = `product_${JSON.stringify(productId)}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
  
      if (offerId) {
        console.log('offerId',offerId)
        offer = await Offer.findOneBy({ id: offerId });
      } else {
        console.log('no have offer')
        offer = await Offer.findOneBy({ productId: productId, sellerId: sellerId });
      }
  
      if (offer) {
        try {
          await offer.remove();
        } catch (e){
         console.log('reeemove offer',e)
        }
 
        return true;
      } else {
        // Handle the case where the offer is not found
        return false;
      }
    } catch (e) {
      // Log or handle the error appropriately
      return false;
    }
  }
  

  async getProductOf(offer: Offer) {
    return await offer.product;
  }

  async brandIdToProductsIds(
    indexBrandToSeller: IndexTakeBrandToSeller,
  ): Promise<number[]> {
    // Get and return unique products ids if cached
    const cacheKey = `productsIds_brandId_${JSON.stringify(
      indexBrandToSeller,
    )}`;
    const cachedData = await this.cacheManager.get<number[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Find unique products ids
    const brandId = indexBrandToSeller.brandId;
    const products: Product[] = await Product.findBy({ brandId });

    const uniqueProductsIds = [
      ...new Set(await Promise.all(products.map(async product => product.id))),
    ];

    // cache the result
    await this.cacheManager.set(cacheKey, uniqueProductsIds, CacheTTL.ONE_WEEK);

    return uniqueProductsIds;
  }

  async productIdsToSellerIds(
    uniqueProductsIds: number[],
    indexBrandToSeller: IndexTakeBrandToSeller,
  ): Promise<number[]> {
    try {
      // Get and return unique sellers ids if cached
      const cacheKey = `SellersIds_brandId_${JSON.stringify(
        indexBrandToSeller,
      )}`;
      const cacheData = await this.cacheManager.get<number[]>(cacheKey);
      if (cacheData) {
        return cacheData;
      }

      // Find unique seller ids
      const offersPromise = await Offer.findBy({
        productId: In(uniqueProductsIds),
      });

      const uniqueSellerIds = [
        ...new Set(
          await Promise.all(
            offersPromise.map(async offer => (await offer.seller).id),
          ),
        ),
      ];

      // cache result
      await this.cacheManager.set(cacheKey, uniqueSellerIds, CacheTTL.ONE_WEEK);

      return uniqueSellerIds;
    } catch (error) {
      console.log(error);
    }
  }

  async getModifiedSellers(
    uniqueSellerIds: number[],
    indexBrandToSeller: IndexTakeBrandToSeller,
  ): Promise<{ modifiedData: Seller[]; total: number }> {
    try {
      // Get and return sellers and total if cached
      const cacheKey = `ModifiedSellers_brandId_${JSON.stringify(
        indexBrandToSeller,
      )}`;
      const cacheData = await this.cacheManager.get<{
        modifiedData: Seller[];
        total: number;
      }>(cacheKey);

      if (cacheData) {
        return cacheData;
      }

      // Find seller
      const [data, total] = await Seller.findAndCount({
        skip:indexBrandToSeller.skip,
        take:indexBrandToSeller.take,
        where: {  id: In(uniqueSellerIds), },
  
      });

      const modifiedData = await Promise.all(
        data.map(async seller => {
          // seller.sum = await this.getOfferLength(seller.id) 
          return seller;
        }),
      );
      const result = {
        modifiedData,
        total,
      };

      
      // cache result
      // await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async takeBrandToSeller(
    indexBrandToSeller: IndexTakeBrandToSeller,
  ): Promise<PaginationSellerResponse> {
    try {
      indexBrandToSeller.boot();
    
      const { brandId, take, skip } = indexBrandToSeller;

      const cacheKey = `indexTakeBrandToSeller_sellers_brand_${JSON.stringify(indexBrandToSeller)}`;
      const cacheData = await this.cacheManager.get<PaginationSellerResponse>(
        cacheKey
      );
      if (cacheData) {
        cacheData.data.forEach(seller => {
          seller.createdAt = new Date(seller.createdAt);
          seller.updatedAt = new Date(seller.updatedAt);
        })
        return cacheData;
      }

      const query = `
          SELECT *,
                (SELECT COUNT(*) 
                  FROM product_sellers ps 
                  WHERE ps.id IN (
                      SELECT DISTINCT "sellerId"
                      FROM product_offers po 
                      WHERE po."productId" IN (
                          SELECT DISTINCT id  
                          FROM products p 
                          WHERE p."brandId" = $1
                      )	
                  )) AS total
          FROM product_sellers ps 
          WHERE ps.id IN (
              SELECT DISTINCT "sellerId"
              FROM product_offers po 
              WHERE po."productId" IN (
                  SELECT DISTINCT id  
                  FROM products p 
                  WHERE p."brandId" = $1
              )	
          )
          ORDER BY ps."sum" desc, ps."rating" desc 
          LIMIT $2
          OFFSET $3;
      `
      let sellers = await this.dataSource.query(query, [brandId, take, skip]);

      let total = 0
      const modifiedSellers = sellers.map((seller: any) => {
        total = seller['total'];
        delete seller['total']
        const s: Seller = Seller.create(seller);
        return s;
      })
     
      // add logoFole and bannerfile
      for (let i = 0; i < modifiedSellers.length; i++){
        const seller = sellers[i];
        const s = modifiedSellers[i];
        if (seller.logoFileId) {
            const cacheKey = `seller_logofile_${JSON.stringify(seller.logoFileId)}`;
            const cacheData = await this.cacheManager.get<PaginationSellerResponse>(
              cacheKey
            );
            if (cacheData) {
              s.logoFile = cacheData;
            } else {
              const file = await File.findOneBy({ id: seller.logoFileId })
              s.logoFile = file;
              await this.cacheManager.set(cacheKey, file, CacheTTL.ONE_WEEK);
            }
        }
        else {
            s.logoFile = null;
        }
      }


      const response = PaginationSellerResponse.make(
        indexBrandToSeller,
        total,
        modifiedSellers,
      );

      const jsonString = JSON.stringify(response).replace(/__bannerFile__/g, 'bannerFile')
      .replace(/__logoFile__/g, 'logoFile');

      const result = JSON.parse(jsonString);

      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

      return response;
    } catch (e) {
      console.log(e);
    }
  }


  async getSellerOf(offer: Offer) {
    return await offer.seller;
  }

  async getLastPublicConsumerPriceOf(offer: Offer): Promise<Price> {

    try {
      const cacheKey = `consumer_lowestPrice_${offer.id}`;
      const cachedResult = await this.cacheManager.get<Price>(cacheKey);
      if (cachedResult) {
        cachedResult.createdAt = new Date(cachedResult.createdAt);
        return cachedResult;
      }
      const result =  await LastPrice.createQueryBuilder()
        .where('"productId" = :productId and "sellerId" = :sellerId', offer)
        .getOne();
      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_DAY)
      
      return result
    } catch (e) {
      console.log('eeeeeeeeeeee',e)
    }
  }
  async getOfferLength(id): Promise<number> {
    const seller = await Seller.findOneBy({ id: id });
    const offers = await seller.offers; // Wait for the Promise to resolve

    return offers.length;
  }
}
