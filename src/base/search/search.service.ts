import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { PaginationProductResponse } from "src/products/product/dto/pagination-product.response";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { SelectQueryBuilder } from "typeorm";
import { Category } from "../taxonomy/category/entities/category.entity";
import { FilterableAttributeInput } from "./dto/filterable-attribute.input";
import { FilterableAttributeResponse } from "./dto/filterable-attribute.response";
import { FilterableAttributesInput } from "./dto/filterable-attributes.input";
import { FilterableAttributesResponse } from "./dto/filterable-attributes.response";
import { SearchInput } from "./dto/search.input";
import { SearchResponse } from "./dto/search.response";
import { SuggestInput } from "./dto/suggest.input";
import { SuggestResponse } from "./dto/suggest.response";
import { SuggestResponseV2 } from "./dto/suggest.response-v2";
import { ProductEntity } from "src/products/product/entities/product-service.entity";
import { Like } from "typeorm";
import { suggestvalue } from "./constants/suggestConstants";

@Injectable()
export class SearchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
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

  async suggest(suggestInput: SuggestInput): Promise<SuggestResponse> {
    let { query, cityId, SKU } = suggestInput;
    query = query.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const productsQuery = this.getProductsSearchQuery(query);
    const categoriesQuery = this.getCategoriesSearchQuery(query);
    const sellerQuery = this.getSellerSearchQuery(query, cityId);
    const brandQuery = this.getBrandQuery(query);

    // Parallelize queries using Promise.all
    const [products, categories, seller, brand] = await Promise.all([
      // SKU filtering using IN clause for better performance
      SKU
        ? productsQuery
            .andWhere("sku IN (:...skus)", { skus: [`%${SKU}%`] })
            .limit(suggestvalue)
            .getMany()
        : productsQuery.limit(suggestvalue).getMany(),
      categoriesQuery.limit(suggestvalue).getMany(),
      // Add a where clause to filter by cityId
      cityId
        ? sellerQuery
            .andWhere("addresses.cityId = :cityId", { cityId })
            .limit(suggestvalue)
            .getMany()
        : sellerQuery.limit(suggestvalue).getMany(),
      brandQuery.limit(suggestvalue).getMany(),
    ]);

    return { products, categories, seller, brand };
  }

  async suggestv2(suggestInput: SuggestInput): Promise<SuggestResponseV2> {
    const { query, cityId, SKU } = suggestInput;
    const products = await ProductEntity.find({
      where: {
        name: Like(`%${query}%`),
      },
      take:suggestvalue,
    });

    return {
      products,
    };
  }
  private getProductsSearchQuery(
    query: string,
    take?: number,
    skip?: number,
  ): SelectQueryBuilder<Product> {
    return Product.createQueryBuilder()
      .where(
        `to_tsvector('english', COALESCE(name, '')) @@ websearch_to_tsquery(:query)`,
        {
          query,
        },
      )
      .orderBy(
        `ts_rank_cd(to_tsvector('english', COALESCE(name, '')), websearch_to_tsquery(:query))`,
        "DESC",
      )
      .skip(skip)
      .take(take);
  }

  private getCategoriesSearchQuery(
    query: string,
    take?: number,
    skip?: number,
  ): SelectQueryBuilder<Category> {
    const fieldsString = `COALESCE(title, '') || ' '`;
    return Category.createQueryBuilder()
      .where(`to_tsvector(${fieldsString}) @@ websearch_to_tsquery(:query)`, {
        query,
      })
      .orderBy(
        `ts_rank_cd(to_tsvector(${fieldsString}), websearch_to_tsquery(:query))`,
        "DESC",
      )
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
