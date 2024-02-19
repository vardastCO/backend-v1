import { registerEnumType } from "@nestjs/graphql";

export enum ContactInfoRelatedTypes {
  SELLER = "Seller",
  BRAND = "Brand",
  USER = "User",
}

registerEnumType(ContactInfoRelatedTypes, {
  name: "ContactInfoRelatedTypes",
});
