import { registerEnumType } from "@nestjs/graphql";

export enum AddressRelatedTypes {
  SELLER = "Seller",
  BRAND = "Brand",
  USER = "User",
}

registerEnumType(AddressRelatedTypes, {
  name: "AddressRelatedTypes",
});
