import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from '@nestjs/microservices';
import axios from "axios";
import { Cache } from "cache-manager";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { filterObject } from "src/base/utilities/helpers";
import { User } from "src/users/user/entities/user.entity";
import { Brackets, EntityManager, In, Like,IsNull } from 'typeorm';
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Brand } from "../brand/entities/brand.entity";
import { Image } from "../images/entities/image.entity";
import { Offer } from "../offer/entities/offer.entity";
import { LastPrice } from "../price/entities/last-price.entity";
import { Price } from "../price/entities/price.entity";
import { Uom } from "../uom/entities/uom.entity";
import { CreateProductInput } from "./dto/create-product.input";
import { IndexProductInputV2 } from "./dto/index-product-v2.input";
import { IndexProductInput } from "./dto/index-product.input";
import { PaginationProductV2Response } from "./dto/pagination-product-v2.response";
import { PaginationProductResponse } from "./dto/pagination-product.response";
import { UpdateProductInput } from "./dto/update-product.input";
import { ProductEntity } from "./entities/product-service.entity";
import { Product } from "./entities/product.entity";
import { ProductSortablesEnum } from "./enums/product-sortables.enum";
import { CreateProductSellerInput } from "./dto/create-product-seller.input";
import { v4 as uuidv4 } from 'uuid';
import { Seller } from "../seller/entities/seller.entity";
import * as zlib from 'zlib';
import { SellerRepresentative } from "../seller/entities/seller-representative.entity";
import { PaginationOfferResponse } from "../offer/dto/pagination-offer.response";
import { IndexOffersPrice } from "./dto/index-price-offers.input";
interface MainQueryResult {
  totalCount: number;
  data: any[];
}
@Injectable()
export class ProductService {
  private productClient: ClientProxy;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly entityManager: EntityManager,
  ) {
    // this.productClient = ClientProxyFactory.create({
    //   transport: Transport.RMQ,
    //   options: {
    //     urls: ['amqp://rabbitmq:5672'],
    //     queue: 'product_queue',
    //   },
    // });

  }

  async create(
    createProductInput: CreateProductInput,
    user: User,
  ): Promise<Product> {
    const product: Product = Product.create<Product>(createProductInput);
    product.createdBy = Promise.resolve(user);
    await product.save();
    return product;
  }

  
  async createFromSeller(
    createProductInput: CreateProductSellerInput,
    user: User,
  ): Promise<Product> {
    const product: Product = Product.create<Product>(createProductInput);
    product.createdBy = Promise.resolve(user);
    product.sku = uuidv4()
    await product.save();
    return product;
  }

   getOrderClause(orderBy: ProductSortablesEnum) {
    switch (orderBy) {
      case ProductSortablesEnum.NEWEST:
        return { rank : 'DESC' };
      case ProductSortablesEnum.OLDEST:
        return { rank : 'DESC' };
      case ProductSortablesEnum.MOST_EXPENSIVE:
        return {
          rank: 'DESC'
        }; // Assuming 'prices.amount' is the correct path
      case ProductSortablesEnum.MOST_AFFORDABLE:
        return {
          rank : 'DESC'
        };  // Assuming 'prices.amount' is the correct path
      default:
        return { createdAt: 'DESC' }; // Default sorting by rank in descending order
    }
  }
  async findAll(indexProductInput?: IndexProductInput): Promise<Product[]> {
    const {
      take,
      skip,
      sku,
      brandId,
      categoryIds,
      uomId,
      sellerId,
      isActive,
      createdById,
      query,
    } = indexProductInput || {};

    const queryBuilder = Product.createQueryBuilder()
      .skip(skip)
      .take(16)
      .where(
        filterObject({
          sku,
          brandId,
          uomId,
          isActive,
          createdById,
        }),
      )
      .orderBy({ id: "DESC" });

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('"categoryId" in (select child_category_ids(:categoryId))', {
            categoryId: categoryIds.shift(),
          });
          for (const index in categoryIds) {
            qb.orWhere(
              `"categoryId" in (select child_category_ids(:categoryId${index}))`,
              { [`categoryId${index}`]: categoryIds[index] },
            );
          }
        }),
      );
    }

    if (query) {
      const p = new Product();
      queryBuilder
        .andWhere(p.getSearchConstraint(), { query })
        .orderBy(p.getSearchOrder(), "DESC");
    }

    return await queryBuilder.getMany();
  }

  async paginate(
    indexProductInput?: IndexProductInput,
  ): Promise<PaginationProductResponse> {
    indexProductInput.boot();
    const cacheKey = `products_${JSON.stringify(indexProductInput)}`;
    const cachedData = await this.cacheManager.get<String>(
      cacheKey,
    );
    
    if (cachedData) {
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: PaginationProductResponse = JSON.parse(decompressedData);
      return parsedData;
    }
   
    const {
      take,
      skip,
      sku,
      brandId,
      categoryIds,
      uomId,
      sellerId,
      isActive,
      createdById,
      query,
      techNum,
      attributes,
    } = indexProductInput || {};
    const whereConditions: any = filterObject({
      sku,
      brandId,
      uomId,
      techNum,
      isActive,
      createdById,
    });
    whereConditions.deletedAt = IsNull();

    if (categoryIds && categoryIds.length > 0) {
      whereConditions.categoryId = In(categoryIds);
    }
    
 
   
    if (sellerId) {
      whereConditions.offers = {
        sellerId: sellerId,
      };
    }

    if (query) {
      whereConditions[`name`] = Like(`%${query}%`);
    }

    if (attributes !== undefined && attributes.length > 0) {

      for (const attribute of attributes) {
        attribute.value = JSON.stringify(attribute.value);
    
        whereConditions.attributeValues = {
          attributeId: attribute.id,
          value: attribute.value,
        };
  
      }
    }
    
    const [products, totalCount] = await Product.findAndCount({
      where: whereConditions,
      relations: ["images", "prices", "uom", "category"],
      order: {
        rating: "DESC",
        // prices: {
        //   id: 'DESC' ,
        //   createdAt: 'DESC'
        // },
        // createdAt: indexProductInput.orderBy == ProductSortablesEnum.NEWEST ?
        //   'DESC' : 'ASC'
      },
      // order: this.getOrderClause(indexProductInput.orderBy) as any,
      skip: skip,
      take: take,
    });
    const jsonString = JSON.stringify(products).replace(/__imageCategory__/g, 'imageCategory')
      .replace(/__uom__/g, 'uom')
      .replace(/__has_uom__/g, 'has_uom')
      .replace(/__has_category__/g, 'has_category')
      .replace(/__category__/g, 'category')
      .replace(/__file__/g, 'file')
      .replace(/__images__/g, 'images')
      ;

      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);

    // console.log(totalCount,indexProductInput)
    
    const result = PaginationProductResponse.make(indexProductInput,totalCount, modifiedDataWithOutText);
    // await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_DAY);

    const compressedData = zlib.gzipSync(JSON.stringify(result));
    await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);

    // await this.productClient.emit('product.paginated', result);
    
    return result;
  }

  async paginateV2(
    indexProductInput?: IndexProductInputV2,
  ): Promise<PaginationProductV2Response> {
    indexProductInput.boot();
    const {
      take,
      skip,
    } = indexProductInput || {};
    try {
      
      
      const [products, totalCount] = await ProductEntity.findAndCount({
        relations: [
            "parent.brand",
            "parent.uom",
            "parent.category",
            "parent.option.attribuite",
            "parent.option.value",
        ],
        skip: skip,
        take: take,
        order: {
          parent: {
            option: {
              attribuite: {
                id : 'ASC'
              }
            }
          }
        }
      });

      const result = PaginationProductV2Response.make(
        indexProductInput,
        totalCount,
        products,
      );
      
      return result;
    } catch (e) {
      console.log("fffffff", e);
    }
  }

  async findOne(id: number, slug?: string): Promise<Product> {
    const product = await Product.findOneBy({
      id, slug,
      status : ThreeStateSupervisionStatuses.CONFIRMED
    });
    if (!product) {
      throw new NotFoundException();
    }
    // this.logProductView(id);

    return product;
  }

  async logProductView(productId: number): Promise<void> {
    const viewsKey = `product_views_${productId}`;
    const views: any[] = (await this.cacheManager.get(viewsKey)) || [];

    views.push({ timestamp: new Date().toISOString() });

    await this.cacheManager.set(viewsKey, views);
  }

  async getOffersPrice(indexOffersPrice: IndexOffersPrice): Promise<PaginationOfferResponse> {
  indexOffersPrice.boot();
  const { take, skip, productId } = indexOffersPrice || {};


  const lastPrice = await Price.find({
    
    where: { productId },
    order: { createdAt: 'DESC' },
     
  });

  // Step 2: Extract the seller IDs from the obtained price.
  const sellerIds: number[] = [];
  if (lastPrice) {
    lastPrice.forEach(element => {
      sellerIds.push(element.sellerId)
      
    });
  }

  // Step 3: Remove duplicate seller IDs.
  const uniqueSellerIds = Array.from(new Set(sellerIds));
    

  // Step 4: Use the unique seller IDs to filter offers.
  const [data, total] = await Offer.findAndCount({
    skip,
    take,
    where: {
      productId,
      sellerId: In(uniqueSellerIds), // Filter offers by unique seller IDs
    },
    order: {
      lastPublicConsumerPrice : {
        id : "DESC"
      }
    }
  });

  return PaginationOfferResponse.make(indexOffersPrice, total, data);
}

  async getProductViewCount(productId: number): Promise<number> {
    const index = "product_views";

    const query = {
      query: {
        term: { productId },
      },
    };
    const baseURL = "http://elasticsearch:9200";
    const url = `${baseURL}/${index}/_search`;

    try {
      const response = await axios.post(url, query);
      const count = response.data.hits.total.value;
      return count;
    } catch (error) {
      console.error("Error retrieving product view count:", error.message);
      // Handle error as needed
      return 0;
    }
  }

  async update(
    id: number,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    const product: Product = await Product.preload({
      id,
      ...updateProductInput,
    });
    if (!product) {
      throw new NotFoundException();
    }
    await product.save();
    return product;
  }

  async remove(id: number): Promise<Product> {
    const product: Product = await this.findOne(id);
    product.deletedAt = new Date();
    // product.id = id;
    await product.save()
    return product;
  }

  async getBrandOf(product: Product): Promise<Brand> {
    return await product.brand;
  }

  async getCategoryOf(product: Product): Promise<Category> {
    return await product.category;
  }

  async getUomOf(product: Product): Promise<Uom> {
    return await product.uom;
  }

  async getPricesOf(product: Product): Promise<Price[]> {


    const latestPrices = await Price.find({
      where: {
        productId: product.id,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 5,
    });

    return latestPrices;
  }

  async getAttributeValuesOf(product: Product): Promise<AttributeValue[]> {
    return await product.attributeValues;
  }

  async getCreatedByOf(product: Product): Promise<User> {
    return await product.createdBy;
  }

  async getOffersOf(product: Product, currentUser: User): Promise<Offer[]> {
    // TODO: filter based on role
    if (!currentUser) {
      return (await product.offers).filter(
        offer =>
          offer.status == ThreeStateSupervisionStatuses.CONFIRMED &&
          offer.isPublic,
      );
    }
    return await product.offers;
  }
  async getPublicOffersOf(product: Product): Promise<Offer[]> {

    // const cacheKey = `public_offers_${JSON.stringify(product.id)}`;
    // const cachedData = await this.cacheManager.get<Offer[]>(cacheKey);
  
    // if (cachedData) {
    //   // return cachedData;
    // }

    const offers = await Offer.createQueryBuilder()
      .innerJoin(
        subQuery =>
          subQuery
            .select('MAX("Offer"."id")', "maxId")
            .addSelect('"Offer"."sellerId"')
            .from(Offer, "Offer")
            .where('"Offer"."productId" = :productId', {
              productId: product.id,
            })
            // .andWhere(
            //   `("Offer"."sellerId" = 1 OR exists (select 0 from product_prices where "sellerId" = "Offer"."sellerId" and "productId" = "Offer"."productId"))`,
            // )
            .groupBy('"Offer"."sellerId"'),
        "maxIds",
        '"Offer"."id" = "maxIds"."maxId"',
    )
      // .take(5)
      // .orderBy(
      //   { createdAt: 'DESC' }
         
      // )
      // .innerJoinAndSelect('Offer."lastPublicConsumerPrice"', 'lastPublicConsumerPrice') // Removed double quotes around "Offer"
      // .orderBy('lastPublicConsumerPrice.createdAt', 'DESC')
      .orderBy('"Offer"."createdAt"', 'DESC') 
      .getMany();
    
    // await this.cacheManager.set(cacheKey,offers,CacheTTL.ONE_DAY)

    return offers;
  }

  async getLowestPriceOf(product: Product): Promise<Price> {
    try {
    const cacheKey = `product_${product.id}_lowestPrice`;

    // // Try to get the result from cache
    // const cachedResult = await this.cacheManager.get<Price>(cacheKey);
    // if (cachedResult) {
    
    //   return cachedResult;
    //  }
      const IDS = product.id;
      const result = await Price.findOne({
        where: { productId: IDS, deletedAt: IsNull() },
        relations: ["seller"],
        order: {
          createdAt: "DESC"
        },
      });

      if (result) {
        const jsonString = JSON.stringify(result).replace(/__seller__/g, 'seller');
        const modifiedDataWithOutText = JSON.parse(jsonString);
    
        // Cache the result only if it's not null
        await this.cacheManager.set(cacheKey, modifiedDataWithOutText, CacheTTL.ONE_DAY);
      }
    
      return result 
      
    } catch (e) {
      console.log('eeeeeeeeeeee',e)
    }
    
  }

  async getMyPriceOf(product: Product, userId: number): Promise<Price | null> {
    const seller = await SellerRepresentative.findOneBy({ userId });
    let price 
    if (seller) {
      price = await Price.findOne({
        where: {
          productId: product.id,
          sellerId: (await seller).sellerId,
        },
        order: {
          id: 'DESC'
        }
       
      });

      
    }


    return price || null;
 
  }

  async getSameCategory(product: Product): Promise<Product[]> {
    const queryBuilder = Product.createQueryBuilder();
    const result = queryBuilder
      .leftJoin(Image, "images", `images.productId = ${queryBuilder.alias}.id`)
      .addSelect(["COUNT(images.id) AS image_count"])
      .leftJoin(Price, "prices", `prices.productId = ${queryBuilder.alias}.id`)
      .addSelect(["COUNT(prices.id) AS price_count"])
      .groupBy(`${queryBuilder.alias}.id`)
      .addOrderBy(
        "CASE WHEN COUNT(images.id) > 0 AND COUNT(prices.id) > 0 THEN 1 WHEN COUNT(prices.id) > 0 AND COUNT(images.id) = 0 THEN 2 WHEN COUNT(prices.id) = 0 AND COUNT(images.id) > 0 THEN 3 ELSE 4 END",
      )
      .where({ categoryId: product.categoryId })
      .limit(5)
      .getMany();
    
    return result
  }


  async getSameCategoryV2(product: Product): Promise<Product[]> {

    const cacheKey = `product_same_category_${JSON.stringify(product.categoryId)}`;
    const cachedData = await this.cacheManager.get<Product[]>(
      cacheKey,
    );

    if (cachedData) {
      cachedData.forEach(product => {
        product.createdAt = new Date(product.createdAt);
        product.updatedAt = new Date(product.updatedAt);
      });
      return cachedData;
    }

    const query = `
      SELECT DISTINCT
      p.*,
      CASE
          WHEN i."productId" IS NOT NULL AND pr."productId" IS NOT NULL THEN 1
          WHEN i."productId" IS NOT NULL THEN 2
          ELSE 3
      END AS order_condition
      FROM
          products p
      LEFT JOIN
          product_images i ON i."productId" = p.id
      LEFT JOIN
          product_prices pr ON pr."productId" = p.id
      WHERE
          p."categoryId" = $1
      ORDER BY
          CASE
              WHEN i."productId" IS NOT NULL AND pr."productId" IS NOT NULL THEN 1
              WHEN i."productId" IS NOT NULL THEN 2
              ELSE 3
          END
      LIMIT 5;
    `
    const result = await this.entityManager.query(query, [product.categoryId]);
    const products = result.map((product) => {
      delete product.order_condition
      const p = Product.create<Product>(product);
      return p
    })

    await this.cacheManager.set(cacheKey, products, CacheTTL.ONE_MONTH);

    return products;
  }

  async getHighestPriceOf(product: Product): Promise<Price> {
    const cacheKey = `highestPrice_${product.id}`;

    const cachedResult = await this.cacheManager.get<string>(cacheKey);
      if (cachedResult) {
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedResult, 'base64')).toString('utf-8');
      const parsedData: Price = JSON.parse(decompressedData);
      parsedData.createdAt = new Date(parsedData.createdAt);
      return parsedData;
    }
    const result =  await LastPrice.createQueryBuilder()
      .where({ productId: product.id })
      .orderBy({ amount: "DESC" })
      .limit(1)
      .getOne();
    
    const compressedData = zlib.gzipSync(JSON.stringify(result));
    await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_DAY);
    
    return result
  }

  private async executeMainQuery(
    sku: string,
    brandId: number,
    uomId: number,
    isActive: boolean,
    createdById: number,
    skip: number,
    take: number,
): Promise<MainQueryResult> {
    const totalCountQuery = `
      SELECT COUNT(pv.id) AS total_count
      FROM products_varient pv 
      LEFT JOIN product_images img ON pv.id = img."productEntityId" 
      LEFT JOIN product_prices prc ON pv.id = prc."productEntityId";
    `;

    const mainQuery = `
      SELECT pv.*
      FROM products_varient pv 
      LEFT JOIN product_images img ON pv.id = img."productEntityId" 
      LEFT JOIN product_prices prc ON pv.id = prc."productEntityId" 
      GROUP BY pv.id
      ORDER BY
        CASE
          WHEN COUNT(img.id) > 0 AND COUNT(prc.id) > 0 THEN 1
          WHEN COUNT(prc.id) > 0 AND COUNT(img.id) = 0 THEN 2
          WHEN COUNT(prc.id) = 0 AND COUNT(img.id) > 0 THEN 3
          ELSE 4
        END
      OFFSET $1
      LIMIT $2;
    `;

    const totalCountResult = await this.entityManager.query(totalCountQuery);
    const totalCount = totalCountResult[0]?.total_count || 0;

    const mainQueryResult = await this.entityManager.query(mainQuery, [skip, take]);

    // You can return both the total count and the paginated result if needed
    return { totalCount, data: mainQueryResult };
}


  private async executeTotalCountQuery(
    sku: string,
    brandId: number,
    uomId: number,
    isActive: boolean,
    createdById: number,
  ): Promise<number> {
    const [result] = await this.entityManager.query(
      `
      SELECT COUNT(DISTINCT products_varient.id)
      FROM products_varient
      LEFT JOIN product_images img ON products_varient.id = img.productEntityId
      LEFT JOIN product_prices prc ON products_varient.id = prc.productEntityId
      WHERE
        products_varient.sku = $1
        AND ($2 IS NULL OR products_varient.brandId = $2)
        AND ($3 IS NULL OR products_varient.uomId = $3)
        AND ($4 IS NULL OR products_varient.isActive = $4)
        AND ($5 IS NULL OR products_varient.createdById = $5);
    `,
      [sku, brandId, uomId, isActive, createdById],
    );

    return parseInt(result, 10);
  }
}
