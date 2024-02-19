import { registerEnumType } from "@nestjs/graphql";

export enum PriceTypesEnum {
  CONSUMER = 1,
  COOP = 2,
  ONLY_FOR_US = 3,
}

registerEnumType(PriceTypesEnum, { name: "PriceTypesEnum" });
