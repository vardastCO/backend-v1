import { registerEnumType } from "@nestjs/graphql";

export enum ProductImageStatusEnum {
  NO_IMAGE = 0,
  HAS_IMAGE = 1,
}


registerEnumType(ProductImageStatusEnum, { name: "ProductImageStatusEnum" });
