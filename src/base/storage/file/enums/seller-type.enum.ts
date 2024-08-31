import { registerEnumType } from "@nestjs/graphql";

export enum SellerTypeEnum {
  LOGO = "LOGO",
}

registerEnumType(SellerTypeEnum, {
  name: "SellerTypeEnum",
});
