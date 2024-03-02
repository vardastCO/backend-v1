import { registerEnumType } from "@nestjs/graphql";

export enum DiscountTypesEnum {
  PERCENT = 1,
}

registerEnumType(DiscountTypesEnum, { name: "DiscountTypesEnum" });
