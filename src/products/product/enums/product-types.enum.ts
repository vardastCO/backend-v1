import { registerEnumType } from "@nestjs/graphql";

export enum ProductTypesEnum {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  BUNDLE = "bundle",
  GIFT = "gift",
}

registerEnumType(ProductTypesEnum, { name: "ProductTypesEnum" });
