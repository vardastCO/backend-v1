import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { PaginationProductResponse } from "src/products/product/dto/pagination-product.response";
import { ProductEntity } from "src/products/product/entities/product-service.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { SellerType } from "src/products/seller/enums/seller-type.enum";
import { Project } from "src/users/project/entities/project.entity";
import { User } from "src/users/user/entities/user.entity";
import { Like, SelectQueryBuilder, IsNull, EntityManager } from "typeorm";
import { Category } from "../taxonomy/category/entities/category.entity";
import { suggestvalue } from "./constants/suggestConstants";
import { FilterableAttributeInput } from "./dto/filterable-attribute.input";
import { FilterableAttributeResponse } from "./dto/filterable-attribute.response";
import { FilterableAttributesInput } from "./dto/filterable-attributes.input";
import { FilterableAttributesResponse } from "./dto/filterable-attributes.response";
import { SearchInput } from "./dto/search.input";
import { SearchResponse } from "./dto/search.response";
import { SuggestInput } from "./dto/suggest.input";
import { SuggestResponse } from "./dto/suggest.response";
import { SuggestResponseV2 } from "./dto/suggest.response-v2";
import { TotalInfoResponse } from "./dto/totalInfo.output";


@Injectable()
export class SearchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
  private readonly entityManager: EntityManager,
  ) { }
  async filters(
    filterInput: FilterableAttributesInput,
  ): Promise<FilterableAttributesResponse> {
    const { categoryId } = filterInput;

    const cacheKey = `search_filter_${JSON.stringify(filterInput)}`;
    const cachedData =
      await this.cacheManager.get<FilterableAttributesResponse>(cacheKey);

    if (cachedData) {
      // Add created_at and updated_at to handle this issue
      cachedData.filters.forEach(attribute => {
        attribute.createdAt = new Date(attribute.createdAt);
        attribute.updatedAt = new Date(attribute.updatedAt);
      });
      return cachedData;
    }
    const attributes = await Attribute.createQueryBuilder()
      .innerJoin(
        "product_attribute_categories",

        "pac",
        'pac."attributeId" = id',
      )
      .where('"categoryId" in (select parent_category_ids(:categoryId))', {
        categoryId,
      })
      .andWhere('"isPublic"')
      .andWhere('"isFilterable"')
      .getMany();

    const result = {
      filters: attributes, // Make sure `attributes` is an array
    };
    await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);
    return result;
  }
  async filterAdmin(
    filterInput: FilterableAttributesInput,
  ): Promise<FilterableAttributesResponse> {
    const { categoryId } = filterInput;
    const attributes = await Attribute.createQueryBuilder("attribute")
      .innerJoinAndSelect("attribute.categories", "category")
      .where("category.id = :categoryId", { categoryId: categoryId })
      .getMany();
    return {
      filters: attributes,
    };
  }

  async filter(
    filterInput: FilterableAttributeInput,
  ): Promise<FilterableAttributeResponse> {
    const { attributeId } = filterInput;
    const attribute = await Attribute.createQueryBuilder()
      .where({ id: attributeId })
      .andWhere('"isPublic"')
      .andWhere('"isFilterable"')
      .getOne();

    if (!attribute) {
      throw new NotFoundException();
    }

    return {
      filter: attribute,
    };
  }

  async search(searchInput: SearchInput): Promise<SearchResponse> {
    searchInput.boot();
    const { query, take, skip } = searchInput;
    const products = await this.getProductsSearchQuery(
      query,
      take,
      skip,
    ).getMany();

    const productsCount = await this.getProductsSearchQuery(query).getCount();

    return {
      products: PaginationProductResponse.make(
        searchInput,
        productsCount,
        products,
      ),
    };
  }

  async  findOrCreateSearchEntity(query: string) {
    await this.entityManager.query(
        `INSERT INTO search_query (query, views)
         VALUES ($1, $2)
         ON CONFLICT (query)
         DO UPDATE SET views = search_query.views + 1`,
        [query, 1]
    );
  }
  async suggest(suggestInput: SuggestInput): Promise<SuggestResponse> {
    let { query, cityId, SKU } = suggestInput;
    query = query.replace(/ي/g, "ی").replace(/ك/g, "ک");
  
    const productsQuery = this.getProductsSearchQuery(query);
    // const sellerQuery = this.getSellerSearchQuery(query, cityId);
    const brandQuery = this.getBrandQuery(query);
    const updateSearchEntityPromise = this.findOrCreateSearchEntity(query); 
  
    const categoriesQuery = await this.getCategoriesSearchQuery(query); 
  
    const [products, categories, seller, brand] = await Promise.all([
      SKU
        ? productsQuery
            .andWhere("sku IN (:...skus)", { skus: [`%${SKU}%`] })
            .limit(suggestvalue)
            .getMany()
        : productsQuery.limit(suggestvalue).getMany(),
      categoriesQuery ? categoriesQuery.limit(suggestvalue).getMany() : [], 
      [],
      brandQuery.limit(suggestvalue).getMany(),
      updateSearchEntityPromise
    ]);
  
    return { products, categories, seller, brand };
  }
  
  

  async suggestv2(suggestInput: SuggestInput): Promise<SuggestResponseV2> {
    const { query, cityId, SKU } = suggestInput;
    const products = await ProductEntity.find({
      where: {
        name: Like(`%${query}%`),
      },
      take: suggestvalue,
    });

    return {
      products,
    };
  }

  async totalInfo(): Promise<TotalInfoResponse> {
    const [
      countOfBrands,
      countOfSellers,
      countOfSellersOnline,
      countOfSellersNormal,
      countOfSellersOffline,
      countOfSellersExtended,
      countOfUsers,
      countOfProducts,
      countOfCategories,
      countOfOrders,
      countOfProjects,
    ] = await Promise.all([
      this.getCountOfBrands(),
      this.getCountOfSellers(),
      this.getCountOfSellersOnline(),
      this.getCountOfSellersNormal(),
      this.getCountOfSellersOffline(),
      this.getCountOfSellersExtended(),
      this.getCountOfUsers(),
      this.getCountOfProducts(),
      this.getCountOfCategories(),
      this.getCountOfOrders(),
      this.getCountOfProjects(),
    ]);

    return {
      countOfBrands,
      countOfSellers,
      countOfSellersOnline,
      countOfSellersNormal,
      countOfSellersOffline,
      countOfSellersExtended,
      countOfUsers,
      countOfProducts,
      countOfCategories,
      countOfOrders,
      countOfProjects,
    };
  }

  private async getCountOfBrands(): Promise<number> {
    const countOfBrands = await Brand.count();
    return countOfBrands;
  }

  private async getCountOfSellers(): Promise<number> {
    const countOfSellers = await Seller.count();
    return countOfSellers;
  }

  private async getCountOfSellersOnline(): Promise<number> {
    const countOfSellersOnline = await Seller.count({
      where: {
        sellerType: SellerType.ONLINE,
      },
    });
    return countOfSellersOnline;
  }

  private async getCountOfSellersNormal(): Promise<number> {
    const countOfSellersNormal = await Seller.count({
      where: {
        sellerType: SellerType.NORMAL,
      },
    });
    return countOfSellersNormal;
  }

  private async getCountOfSellersOffline(): Promise<number> {
    const countOfSellersoffline = await Seller.count({
      where: {
        sellerType: SellerType.OFFLINE,
      },
    });
    return countOfSellersoffline;
  }

  private async getCountOfSellersExtended(): Promise<number> {
    const countOfSellersoffline = await Seller.count({
      where: {
        sellerType: SellerType.EXTENDED,
      },
    });
    return countOfSellersoffline;
  }
  private async getCountOfUsers(): Promise<number> {
    const countOfUsers = await User.count();
    return countOfUsers;
  }

  private async getCountOfProducts(): Promise<number> {
    const countOfProducts = await Product.count();
    return countOfProducts;
  }

  private async getCountOfCategories(): Promise<number> {
    const countOfCategories = await Category.count();
    return countOfCategories;
  }

  private async getCountOfOrders(): Promise<number> {
    const countOfOrders = await OfferOrder.count();
    return countOfOrders;
  }

  private async getCountOfProjects(): Promise<number> {
    const countOfProjects = await Project.count();
    return countOfProjects;
  }

  private getProductsSearchQuery(
    query: string,
    take?: number,
    skip?: number,
  ): SelectQueryBuilder<Product> {
    const products = Product.createQueryBuilder()
      .where(
        `to_tsvector('english', COALESCE(name, '')) @@ websearch_to_tsquery(:query)`,
        {
          query,
        },
    )
      .andWhere({
        deletedAt : IsNull()
      })
      .orderBy(
        `ts_rank_cd(to_tsvector('english', COALESCE(name, '')), websearch_to_tsquery(:query))`,
        "DESC",
      )
      .skip(skip)
      .take(take);
  
    return products;
  }

  async getCategoriesSearchQuery(
    query: string,
    take?: number,
    skip?: number
  ): Promise<SelectQueryBuilder<Category> | null> {
    const product = await Product.findOne({
      where: {
        name: Like(`%${query}%`)
      }
    });

    console.log('product',product)
  
    if (!product) {
      return null; // Handle the case when no product is found
    }
  
    return Category.createQueryBuilder('category')
      .where('category.id = :productId', { productId: product.id })
      .skip(skip)
      .take(take);
  }
  
  private getSellerSearchQuery(
    query: string,
    take?: number,
    skip?: number,
  ): SelectQueryBuilder<Seller> {
    const fieldsString = `COALESCE(name, '') || ' '`;
    return Seller.createQueryBuilder()
      .where("name ILIKE :query", { query: `%${query}%` })
      .andWhere({
        sellerType: SellerType.ONLINE || SellerType.NORMAL,
      })
      .orderBy(
        `ts_rank_cd(to_tsvector(${fieldsString}), websearch_to_tsquery(:query))`,
        "DESC",
      )
      .skip(skip)
      .take(take);
  }

  private getBrandQuery(
    query: string,
    take?: number,
    skip?: number,
  ): SelectQueryBuilder<Brand> {
    const fieldsString = `COALESCE(name, '') || ' '`;
    return Brand.createQueryBuilder()
      .where("name ILIKE :query", { query: `%${query}%` })
      .orderBy(
        `ts_rank_cd(to_tsvector(${fieldsString}), websearch_to_tsquery(:query))`,
        "DESC",
      )
      .skip(skip)
      .take(take);
  }
}
