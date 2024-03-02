import { registerEnumType } from "@nestjs/graphql";

export enum DiscountTypesEnum {
  PERCENT = 'PERCENT',
}

registerEnumType(DiscountTypesEnum, { name: "DiscountTypesEnum" });
