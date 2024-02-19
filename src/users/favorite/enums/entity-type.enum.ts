import { registerEnumType } from "@nestjs/graphql";

export enum EntityTypeEnum {
  BRAND = "BRAND",
  SELLER = "SELLER",
  PRODUCT = "PRODUCT",
}

registerEnumType(EntityTypeEnum, { name: "EntityTypeEnum" });
