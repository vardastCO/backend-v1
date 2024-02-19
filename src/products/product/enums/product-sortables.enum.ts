import { registerEnumType } from "@nestjs/graphql";
import { SelectQueryBuilder } from "typeorm";
import { Product } from "../entities/product.entity";

export enum ProductSortablesEnum {
  NEWEST = "newest",
  OLDEST = "oldest",
  MOST_EXPENSIVE = "most_expensive",
  MOST_AFFORDABLE = "most_affordable",
}
registerEnumType(ProductSortablesEnum, { name: "ProductSortablesEnum" });

export function getProductSortableOrderArgs(
  sortable: ProductSortablesEnum,
  queryBuilder: SelectQueryBuilder<Product>,
): void {
  switch (sortable) {
    case ProductSortablesEnum.NEWEST:
      queryBuilder.orderBy(`${queryBuilder.alias}.id`, "DESC");
      break;
    case ProductSortablesEnum.OLDEST:
      queryBuilder.orderBy(`${queryBuilder.alias}.id`, "ASC");
      break;
    case ProductSortablesEnum.MOST_EXPENSIVE:
      queryBuilder
        .leftJoin(
          '(SELECT max(amount) AS "amount", "productId" FROM "product_prices" GROUP BY "productId")',
          "price",
          `price."productId" = ${queryBuilder.alias}.id`,
        )
        .orderBy("price.amount", "DESC", "NULLS LAST");
      break;
    case ProductSortablesEnum.MOST_AFFORDABLE:
      queryBuilder
        .leftJoin(
          '(SELECT min(amount) AS "amount", "productId" FROM "product_prices" GROUP BY "productId")',
          "price",
          `price."productId" = ${queryBuilder.alias}.id`,
        )
        .orderBy("price.amount", "ASC", "NULLS LAST");
      break;
  }
}
