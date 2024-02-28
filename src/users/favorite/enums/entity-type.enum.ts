import { registerEnumType } from "@nestjs/graphql";

export enum EntityTypeEnum {
  BRAND = "BRAND",
  SELLER = "SELLER",
  PRODUCT = "PRODUCT",
  BASKET = "BASKET",
}

registerEnumType(EntityTypeEnum, { name: "EntityTypeEnum" });
