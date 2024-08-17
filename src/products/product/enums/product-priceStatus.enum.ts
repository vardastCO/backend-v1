import { registerEnumType } from "@nestjs/graphql";

export enum ProductPriceStatusEnum {
  HAS_PRICE = 0,
  NO_PRICE = 1,
  PRICE_LESS_THAN_4_MONTHS = 2, 
  PRICE_LESS_THAN_6_MONTHS = 3  
}


registerEnumType(ProductPriceStatusEnum, { name: "ProductPriceStatusEnum" });
