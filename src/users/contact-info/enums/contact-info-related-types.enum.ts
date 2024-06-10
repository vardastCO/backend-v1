import { registerEnumType } from "@nestjs/graphql";

export enum ContactInfoRelatedTypes {
  SELLER = "Seller",
  BRAND = "Brand",
  USER = "User",
  LEGAL = "LEGAL",
}

registerEnumType(ContactInfoRelatedTypes, {
  name: "ContactInfoRelatedTypes",
});
