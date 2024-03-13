import { ViewEntity } from "typeorm";
import { Price } from "./price.entity";

@ViewEntity({
  name: "product_last_public_consumer_prices",
  expression: `
    SELECT product_prices.id,
      product_prices.type,
      product_prices."isPublic",
      product_prices."createdById",
      product_prices."createdAt",
      product_prices."deletedAt",
      product_prices."productId",
      product_prices."sellerId",
      product_prices.amount,
      product_prices."attributeValueId"
    FROM product_prices
    WHERE (product_prices.id IN ( SELECT max(product_prices_1.id) AS "lastId"
            FROM product_prices product_prices_1
            WHERE product_prices_1.type = '1'::product_prices_type_enum AND product_prices_1."isPublic"
            GROUP BY product_prices_1."productId", product_prices_1."sellerId", product_prices_1."attributeValueId"));
  `,
})
export class LastPrice extends Price {}
