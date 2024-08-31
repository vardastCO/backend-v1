import { registerEnumType } from "@nestjs/graphql";

export enum BrandTypeEnum {
  LOGO = "LOGO",
  CATALOGUE = "CATALOGUE",
  PRICELIST = "PRICELIST",
}

registerEnumType(BrandTypeEnum, {
  name: "BrandTypeEnum",
});
