import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import axios from "axios";
import { Cache } from "cache-manager";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { filterObject } from "src/base/utilities/helpers";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import {
  Brackets,
  EntityManager,
  In,
  IsNull,
  Like,
  MoreThan,
  Not,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import * as zlib from "zlib";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Brand } from "../brand/entities/brand.entity";
import { Image } from "../images/entities/image.entity";
import { PaginationOfferResponse } from "../offer/dto/pagination-offer.response";
import { Offer } from "../offer/entities/offer.entity";
import { Price } from "../price/entities/price.entity";
import { SellerRepresentative } from "../seller/entities/seller-representative.entity";
import { Uom } from "../uom/entities/uom.entity";
import { CreateProductSellerInput } from "./dto/create-product-seller.input";
import { CreateProductInput } from "./dto/create-product.input";
import { IndexOffersPrice } from "./dto/index-price-offers.input";
import { IndexProductInputV2 } from "./dto/index-product-v2.input";
import { IndexProductInput } from "./dto/index-product.input";
import { PaginationProductV2Response } from "./dto/pagination-product-v2.response";
import { PaginationProductResponse } from "./dto/pagination-product.response";
import { UpdateProductInput } from "./dto/update-product.input";
import { ProductEntity } from "./entities/product-service.entity";
import { Product } from "./entities/product.entity";
import { ProductImageStatusEnum } from "./enums/product-imageStatus.enum";
import { ProductPriceStatusEnum } from "./enums/product-priceStatus.enum";
import { ProductSortablesEnum } from "./enums/product-sortables.enum";
import { SortFieldProduct } from "./enums/sort-filed-product.enum";

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
    private authorizationService: AuthorizationService,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
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
    product.sku = uuidv4();
    await product.save();
    return product;
  }

  getOrderClause(orderBy: ProductSortablesEnum) {
    switch (orderBy) {
      case ProductSortablesEnum.NEWEST:
        return { rank: "DESC" };
      case ProductSortablesEnum.OLDEST:
        return { rank: "DESC" };
      case ProductSortablesEnum.MOST_EXPENSIVE:
        return {
          rank: "DESC",
        }; // Assuming 'prices.amount' is the correct path
      case ProductSortablesEnum.MOST_AFFORDABLE:
        return {
          rank: "DESC",
        }; // Assuming 'prices.amount' is the correct path
      default:
        return { createdAt: "DESC" }; // Default sorting by rank in descending order
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
  async getAllCategoryIds(categoryIds: number[]): Promise<number[]> {
    const cacheKey = `categoryIds_child_${JSON.stringify(categoryIds)}`;

    const cachedCategoryIds = await this.cacheManager.get<number[]>(cacheKey);
    if (cachedCategoryIds) {
      return cachedCategoryIds;
    }

    const allCategoryIds: Set<number> = new Set(categoryIds);

    const fetchDescendants = async (categoryId: number) => {
      const childCategories = await Category.find({
        select: ["id"],
        where: { parentCategoryId: categoryId },
      });

      const childCategoryIds = childCategories.map(child => child.id);

      childCategoryIds.forEach(id => {
        if (!allCategoryIds.has(id)) {
          allCategoryIds.add(id);
        }
      });

      return Promise.all(childCategoryIds.map(id => fetchDescendants(id)));
    };

    await Promise.all(categoryIds.map(id => fetchDescendants(id)));

    const result = Array.from(allCategoryIds);

    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

    return result;
  }

  async paginate(
    indexProductInput?: IndexProductInput,
    user?: User,
  ): Promise<PaginationProductResponse> {
    indexProductInput.boot();
    const { sortField, sortDirection } = indexProductInput;

    const admin = await this.authorizationService
      .setUser(user)
      .hasRole("admin");
    if (!admin && indexProductInput.page > 10) {
      indexProductInput.page = 10;
    }
    const cacheKey = `products_${JSON.stringify(indexProductInput)}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    let isAlicePrice = false;
    if (sortField === SortFieldProduct.PRICE) {
      isAlicePrice = true;
    }
    if (cachedData && !admin) {
      const decompressedData = zlib
        .gunzipSync(Buffer.from(cachedData, "base64"))
        .toString("utf-8");
      const parsedData = JSON.parse(decompressedData);
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
      hasPrice,
      techNum,
      attributes,
      hasImage,
    } = indexProductInput || {};

    const whereConditions: any = {
      sku,
      brandId,
      uomId,
      techNum,
      isActive,
      createdById,
      deletedAt: IsNull(),
    };

    if (categoryIds && categoryIds.length > 0) {
      const allCategoryIds = await this.getAllCategoryIds(categoryIds);
      whereConditions.categoryId = In(allCategoryIds);
    }

    if (sellerId) {
      whereConditions.offers = {
        sellerId: sellerId,
      };
    }
    switch (hasImage) {
      case ProductImageStatusEnum.HAS_IMAGE:
        whereConditions.images = {
          id: Not(IsNull()),
        };
        break;

      case ProductImageStatusEnum.NO_IMAGE:
        whereConditions.images = {
          id: IsNull(),
        };
        break;
    }

    switch (hasPrice) {
      case ProductPriceStatusEnum.HAS_PRICE:
        whereConditions.prices = {
          amount: Not(IsNull()),
        };
        break;

      case ProductPriceStatusEnum.NO_PRICE:
        whereConditions.prices = {
          id: IsNull(),
        };
        break;

      case ProductPriceStatusEnum.PRICE_LESS_THAN_4_MONTHS:
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
        whereConditions.prices = {
          createdAt: MoreThan(fourMonthsAgo),
        };
        break;

      case ProductPriceStatusEnum.PRICE_LESS_THAN_6_MONTHS:
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        whereConditions.prices = {
          createdAt: MoreThan(sixMonthsAgo),
        };
        break;
    }
    const whereArray: any[] = [];

    if (query) {
      whereArray.push(
        { ...whereConditions, name: Like(`%${query}%`) },
        { ...whereConditions, description: Like(`%${query}%`) },
      );
    } else {
      whereArray.push(whereConditions);
    }

    if (attributes && attributes.length > 0) {
      for (const attribute of attributes) {
        attribute.value = JSON.stringify(attribute.value);
        whereConditions.attributeValues = {
          attributeId: attribute.id,
          value: attribute.value,
        };
      }
    }

    if (sortField === SortFieldProduct.PRICE) {
      whereConditions.prices = {
        createdAt: MoreThan(
          new Date(
            Date.now() -
              15 *
                60 *
                1000 *
                (process.env.FAKE_LIVE_PRICE === "true" ? 100000 : 1),
          ),
        ),
      };
    }

    let order: any;
    if (indexProductInput.orderBy === ProductSortablesEnum.MOST_AFFORDABLE) {
      order = { prices: { amount: "ASC" } };
    } else if (
      indexProductInput.orderBy === ProductSortablesEnum.MOST_EXPENSIVE
    ) {
      order = { prices: { id: "ASC", amount: "DESC" } };
    } else if (indexProductInput.orderBy === ProductSortablesEnum.MOST_OFFER) {
      order = { offersNum: "DESC" };
    } else if (indexProductInput.orderBy === ProductSortablesEnum.NAME) {
      order = { name: "ASC" };
    } else {
      order = { rating: "DESC" };
    }

    const [totalCount, products] = await Promise.all([
      Product.count({ where: whereArray }),
      Product.find({
        where: whereArray,
        relations: ["prices"],
        order,
        skip,
        take,
      }),
    ]);

    const productIds = products.map(product => product.id);
    const categoryResultId = products.map(product => product.categoryId);
    const brandResultId = products.map(product => product.brandId);

    const uomResultIds = products.map(product => product.uomId);

    const [uoms, categories, images, brands] = await Promise.all([
      this.getUoms(uomResultIds),
      this.getCategories(categoryResultId),
      this.getImages(productIds, admin),
      this.findBrand(brandResultId, !admin),
    ]);

    const response: any[] = products.map(product => ({
      ...product,
      uom: uoms.find(u => u.id === product.uomId),
      category: categories.find(cat => cat.id === product.categoryId),
      images: images.filter(img => img.productId === product.id),
      brand: brands.find(brand => brand.id === product.brandId),
    }));

    const jsonString = JSON.stringify(response)
      .replace(/__file__/g, "file")
      .replace(/__images__/g, "images");

    const modifiedDataWithOutText = JSON.parse(jsonString);

    const result = PaginationProductResponse.make(
      indexProductInput,
      totalCount,
      modifiedDataWithOutText,
    );

    if (!admin) {
      const compressedData = zlib.gzipSync(JSON.stringify(result));
      await this.cacheManager.set(
        cacheKey,
        compressedData,
        isAlicePrice ? CacheTTL.FIFTEEN_MINUTES : CacheTTL.THREE_HOURS,
      );
    }

    

    return result;
  }
  async getUoms(uomResultIds: number[]) {
    const sortedCategoryResultId = uomResultIds.sort((a, b) => b - a);
    const cacheKey = `uoms-${sortedCategoryResultId.join("-")}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const result = await Uom.find({ where: { id: In(uomResultIds) } });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }

  async getCategories(categoryResultId: number[]) {
    const sortedCategoryResultId = categoryResultId.sort((a, b) => b - a);
    const cacheKey = `categories-${sortedCategoryResultId.join("-")}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const result = await Category.find({ where: { id: In(categoryResultId) } });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }

  async getImages(productIds: number[], cache: boolean) {
    const sortedCategoryResultId = productIds.sort((a, b) => b - a);
    const cacheKey = `images-${sortedCategoryResultId.join("-")}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData && cache) {
      return JSON.parse(cachedData);
    }
    const result = await Image.find({ where: { productId: In(productIds) } });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }

  async getPrices(productIds: number[]) {
    const sortedCategoryResultId = productIds.sort((a, b) => b - a);
    const cacheKey = `price-${sortedCategoryResultId.join("-")}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const result = await await Price.find({
      select: [
        "amount",
        "createdAt",
        "isPublic",
        "type",
        "productId",
        "sellerId",
      ],
      where: { productId: In(productIds), deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_HOUR,
    );

    return result;
  }
  async paginateV2(
    indexProductInput?: IndexProductInputV2,
  ): Promise<PaginationProductV2Response> {
    indexProductInput.boot();
    const { take, skip } = indexProductInput || {};
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
                id: "ASC",
              },
            },
          },
        },
      });

      const result = PaginationProductV2Response.make(
        indexProductInput,
        totalCount,
        products,
      );

      return result;
    } catch (e) {
      console.log("err in paginateV2", e);
    }
  }
  private async incrementProductViews(product: Product) {
    try {
      await this.entityManager.query(
        `UPDATE products SET views = views + 1 WHERE id = $1`,
        [product.id],
      );
    } catch (error) {
      console.log("err in incrementProductViews", error);
    }
  }
  async findOne(id: number, no_cache: boolean): Promise<Product> {
    const product = await Product.findOne({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new NotFoundException();
    }

    const [brand, category, uom, images, price, data] = await Promise.all([
      this.findBrand([product.brandId], no_cache),
      this.findCategory(product.categoryId, no_cache),
      this.findUom(product.uomId, no_cache),
      this.getImages([product.id], no_cache),
      this.findPrice(product.id, no_cache),
      this.incrementProductViews(product),
    ]);
    product.brand = brand[0];
    product.category = category;
    product.uom = uom;
    product.images = JSON.parse(
      JSON.stringify(images)
        .replace(/__file__/g, "file")
        .replace(/__images__/g, "images"),
    );
    product.highestPrice = price;
    product.lowestPrice = price;
    product.prices = Promise.all([price]);

    return product;
  }

  async logProductView(productId: number): Promise<void> {
    const viewsKey = `product_views_${productId}`;
    const views: any[] = (await this.cacheManager.get(viewsKey)) || [];

    views.push({ timestamp: new Date().toISOString() });

    await this.cacheManager.set(viewsKey, views);
  }

  // async findAttributes(productId: number) {
  //   const cacheKey = `product_attributes_find_${productId}`;

  //   const cachedData = await this.cacheManager.get<string>(cacheKey);
  //   if (cachedData) {
  //     const jsonString = JSON.stringify(cachedData).replace(
  //       /__attribute__/g,
  //       "attribute",
  //     );
  //     return JSON.parse(jsonString);
  //   }

  //   const result = await AttributeValue.find({
  //     where: { productId },
  //     relations:['attribute']
  //   });
  //   await this.cacheManager.set(
  //     cacheKey,
  //     JSON.stringify(result),
  //     CacheTTL.ONE_WEEK,
  //   );
  //   console.log('dddd',result)
  //   const response = JSON.stringify(result).replace(
  //     /__attribute__/g,
  //     "attribute",
  //   );
  //   return JSON.parse(response);
  // }

  async findImages(productId: number) {
    const cacheKey = `product_images_find_${productId}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      const modifiedDataWithOutText = JSON.stringify(cachedData).replace(
        /__file__/g,
        "file",
      );
      const res: Image[] = JSON.parse(modifiedDataWithOutText);
      return res;
    }

    const result = await Image.find({
      where: { productId },
      relations: ["file"],
    });
    const modifiedDataWithOutText = JSON.stringify(result).replace(
      /__file__/g,
      "file",
    );
    await this.cacheManager.set(
      cacheKey,
      modifiedDataWithOutText,
      CacheTTL.ONE_WEEK,
    );
    return JSON.parse(modifiedDataWithOutText);
  }

  async findBrand(brandIds: number[], cache: boolean) {
    const cacheKey = `product_brand_find_${JSON.stringify(brandIds)}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData && cache) {
      return JSON.parse(cachedData);
    }

    const result = await this.entityManager.query(
      `SELECT id, name, slug FROM product_brands WHERE id = ANY($1)`,
      [brandIds],
    );

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }

  async findCategory(categoryId: number, cache) {
    const cacheKey = `product_category_find_${categoryId}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData && cache) {
      return JSON.parse(cachedData);
    }

    const result = await Category.findOne({
      where: { id: categoryId },
    });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }

  async findUom(uomId: number, cache) {
    const cacheKey = `product_uom_find_${uomId}`;

    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData && cache) {
      return JSON.parse(cachedData);
    }

    const result = await Uom.findOne({
      where: { id: uomId },
    });

    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(result),
      CacheTTL.ONE_WEEK,
    );

    return result;
  }
  async findPrice(productId: number, cache: boolean) {
    try {
      const cacheKey = `product_${productId}_lowestPrice`;

      // // Try to get the result from cache
      const cachedResult = await this.cacheManager.get<string>(cacheKey);
      if (cachedResult && cache) {
        const decompressedData = zlib
          .gunzipSync(Buffer.from(cachedResult, "base64"))
          .toString("utf-8");
        const parsedData: Price = JSON.parse(decompressedData);
        if (parsedData) {
          parsedData.createdAt = new Date(parsedData.createdAt);
        }
        return parsedData;
      }
      const IDS = productId;
      const result = await Price.findOne({
        where: { productId: IDS, deletedAt: IsNull() },
        relations: ["seller"],
        order: {
          createdAt: "DESC",
        },
      });

      if (result) {
        const jsonString = JSON.stringify(result)
          .replace(/__seller__/g, "seller")
          .replace(/__logoFile__/g, "logoFile");
        const modifiedDataWithOutText = JSON.parse(jsonString);
        const compressedData = zlib.gzipSync(
          JSON.stringify(modifiedDataWithOutText),
        );
        await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_DAY);
      }

      return result || null;
    } catch (e) {
      console.log("err in findPrice", e);
    }
  }
  async getOffersPrice(
    indexOffersPrice: IndexOffersPrice,
  ): Promise<PaginationOfferResponse> {
    indexOffersPrice.boot();
    const { take, skip, productId } = indexOffersPrice || {};

    // const lastPrice = await Price.find({
    //   where: { productId },
    //   order: { createdAt: "DESC" },
    // });

    // // Step 2: Extract the seller IDs from the obtained price.
    // const sellerIds: number[] = [];
    // if (lastPrice) {
    //   lastPrice.forEach(element => {
    //     sellerIds.push(element.sellerId);
    //   });
    // }

    // // Step 3: Remove duplicate seller IDs.
    // const uniqueSellerIds = Array.from(new Set(sellerIds));

    // // Step 4: Use the unique seller IDs to filter offers.
    // const [data, total] = await Offer.findAndCount({
    //   skip,
    //   take,
    //   where: {
    //     productId,
    //     sellerId: In(uniqueSellerIds), // Filter offers by unique seller IDs
    //   },
    //   order: {
    //     lastPublicConsumerPrice: {
    //       id: "DESC",
    //     },
    //   },
    // });

    return PaginationOfferResponse.make(indexOffersPrice, 0, []);
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
    const product: Product = await this.findOne(id, true);
    product.deletedAt = new Date();
    // product.id = id;
    await product.save();
    return product;
  }

  async getBrandOf(product: Product): Promise<Brand> {
    return await product.brand;
  }

  async getCategoryOf(product: Product): Promise<Category> {
    try {
      const cacheKey = `category:${product.categoryId}`;

      const cachedData = await this.cacheManager.get<string>(cacheKey);

      if (cachedData) {
        const decompressedData =
          this.decompressionService.decompressData(cachedData);
        return decompressedData;
      }
      const compressedData = this.compressionService.compressData(
        await product.category,
      );
      await this.cacheManager.set(cacheKey, compressedData, CacheTTL.TWO_WEEK);
      return await product.category;
    } catch (error) {
      console.log("err in  getCategoryOf", error);
    }
  }

  async getUomOf(product: Product): Promise<Uom> {
    try {
      const cacheKey = `uom:${product.uomId}`;

      const cachedData = await this.cacheManager.get<string>(cacheKey);

      if (cachedData) {
        const decompressedData =
          this.decompressionService.decompressData(cachedData);
        return decompressedData;
      }
      const compressedData = this.compressionService.compressData(
        await product.uom,
      );
      await this.cacheManager.set(cacheKey, compressedData, CacheTTL.TWO_WEEK);
      return await product.uom;
    } catch (error) {
      console.log("err in  getUomOf", error);
    }
  }

  async getPricesOf(product: Product): Promise<Price[]> {
    // const latestPrices = await Price.find({
    //   where: {
    //     productId: product.id,
    //   },
    //   order: {
    //     createdAt: "DESC",
    //   },
    //   take: 5,
    // });

    return [];
  }

  async getAttributeValuesOf(product: Product): Promise<AttributeValue[]> {
    try {
      const cacheKey = `attributes:${product.id}`;

      const cachedData = await this.cacheManager.get<string>(cacheKey);

      if (cachedData) {
        const decompressedData: AttributeValue[] =
          this.decompressionService.decompressData(cachedData);
        return decompressedData;
      }

      const attributeValues = await product.attributeValues;

      const jsonString = JSON.stringify(attributeValues).replace(
        /__attribute__/g,
        "attribute",
      );

      const modifiedDataWithOutText = JSON.parse(jsonString);
      const compressedData = this.compressionService.compressData(
        modifiedDataWithOutText,
      );

      await this.cacheManager.set(cacheKey, compressedData, CacheTTL.TWO_WEEK);

      return attributeValues;
    } catch (error) {
      console.log("err in getAttributeValuesOf", error);
      throw error;
    }
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
      .orderBy('"Offer"."createdAt"', "DESC")
      .limit(5)
      .getMany();

    return offers;
  }

  // async getLowestPriceOf(product: Product) {
  //   try {
  //     const cacheKey = `product_${product.id}_lowestPrice`;

  //     // // Try to get the result from cache
  //     const cachedResult = await this.cacheManager.get<string>(cacheKey);
  //     if (cachedResult) {
  //       const decompressedData = zlib.gunzipSync(Buffer.from(cachedResult, 'base64')).toString('utf-8');
  //       const parsedData: Price = JSON.parse(decompressedData);
  //       if (parsedData) {
  //         parsedData.createdAt = new Date(parsedData.createdAt);
  //       }
  //       // return parsedData;
  //     }
  //       const IDS = product.id;
  //       const result = await Price.findOne({
  //         where: { productId: IDS, deletedAt: IsNull() },
  //         relations: ["seller"],
  //         order: {
  //           createdAt: "DESC"
  //         },
  //       });

  //       if (result) {
  //         const jsonString = JSON.stringify(result).replace(/__seller__/g, 'seller')
  //         .replace(/__logoFile__/g, 'logoFile');
  //         const modifiedDataWithOutText = JSON.parse(jsonString);
  //         const compressedData = zlib.gzipSync(JSON.stringify(modifiedDataWithOutText));
  //         await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_DAY);
  //       }

  //       return result || null

  //     } catch (e) {
  //       console.log('eeeeeeeeeeee',e)
  //     }

  // }

  async getHighestPriceOf(product: Product) {
    try {
      const cacheKey = `product_${product.id}_lowestPrice`;

      const cachedResult = await this.cacheManager.get<string>(cacheKey);
      if (cachedResult) {
        const decompressedData = zlib
          .gunzipSync(Buffer.from(cachedResult, "base64"))
          .toString("utf-8");
        const parsedData: Price = JSON.parse(decompressedData);
        if (parsedData) {
          parsedData.createdAt = new Date(parsedData.createdAt);
        }
        return parsedData;
      }
      const IDS = product.id;
      const result = await Price.findOne({
        select: ["amount", "discount", "createdAt", "id", "isPublic", "type"],
        where: { productId: IDS, deletedAt: IsNull() },
        order: {
          createdAt: "DESC",
        },
      });

      if (result) {
        const jsonString = JSON.stringify(result)
          .replace(/__seller__/g, "seller")
          .replace(/__logoFile__/g, "logoFile");
        const modifiedDataWithOutText = JSON.parse(jsonString);
        const compressedData = zlib.gzipSync(
          JSON.stringify(modifiedDataWithOutText),
        );
        await this.cacheManager.set(
          cacheKey,
          compressedData,
          CacheTTL.TWO_WEEK,
        );
      }

      return result || null;
    } catch (e) {
      console.log("err in getHighestPriceOf", e);
    }
  }
  async getLowestPriceOf(product: Product): Promise<Price> {
    try {
      const cacheKey = `product_${product.id}_lowestPrice`;

      const cachedResult = await this.cacheManager.get<string>(cacheKey);
      if (cachedResult) {
        const decompressedData = zlib
          .gunzipSync(Buffer.from(cachedResult, "base64"))
          .toString("utf-8");
        const parsedData: Price = JSON.parse(decompressedData);
        if (parsedData) {
          parsedData.createdAt = new Date(parsedData.createdAt);
        }
        return parsedData;
      }
      const IDS = product.id;
      const result = await Price.findOne({
        where: { productId: IDS, deletedAt: IsNull() },
        relations: ["seller"],
        order: {
          createdAt: "DESC",
        },
      });

      if (result) {
        const jsonString = JSON.stringify(result)
          .replace(/__seller__/g, "seller")
          .replace(/__logoFile__/g, "logoFile");
        const modifiedDataWithOutText = JSON.parse(jsonString);
        const compressedData = zlib.gzipSync(
          JSON.stringify(modifiedDataWithOutText),
        );
        await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_DAY);
      }

      return result || null;
    } catch (e) {
      console.log("err in getLowestPriceOf", e);
    }
  }

  async getMyPriceOf(product: Product, userId: number): Promise<Price | null> {
    const seller = await SellerRepresentative.findOneBy({ userId });
    let price;
    if (seller) {
      price = await Price.findOne({
        where: {
          productId: product.id,
          sellerId: (await seller).sellerId,
        },
        order: {
          id: "DESC",
        },
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
      .limit(10)
      .getMany();

    return result;
  }

  async getSameCategoryV2(product: Product): Promise<Product[]> {
    const cacheKey = `product_same_category_${JSON.stringify(
      product.categoryId,
    )}`;
    const cachedData = await this.cacheManager.get<Product[]>(cacheKey);

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
    `;
    const result = await this.entityManager.query(query, [product.categoryId]);
    const products = result.map(product => {
      delete product.order_condition;
      const p = Product.create<Product>(product);
      return p;
    });

    await this.cacheManager.set(cacheKey, products, CacheTTL.TWO_WEEK);

    return products;
  }

  // async getHighestPriceOf(product: Product): Promise<Price> {
  //   const cacheKey = `highestPrice_${product.id}`;

  //   const cachedResult = await this.cacheManager.get<string>(cacheKey);
  //     if (cachedResult) {
  //     const decompressedData = zlib.gunzipSync(Buffer.from(cachedResult, 'base64')).toString('utf-8');
  //       const parsedData: Price = JSON.parse(decompressedData);
  //     if (parsedData) {
  //       parsedData.createdAt = new Date(parsedData.createdAt);
  //     }

  //     return parsedData;
  //   }
  //   const result =  await LastPrice.createQueryBuilder()
  //     .where({ productId: product.id })
  //     .orderBy({ amount: "DESC" })
  //     .limit(1)
  //     .getOne();

  //   const compressedData = zlib.gzipSync(JSON.stringify(result));
  //   await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_DAY);

  //   return result || null
  // }

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

    const mainQueryResult = await this.entityManager.query(mainQuery, [
      skip,
      take,
    ]);

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
