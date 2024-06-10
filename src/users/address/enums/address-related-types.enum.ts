import { registerEnumType } from "@nestjs/graphql";

export enum AddressRelatedTypes {
  SELLER = "Seller",
  BRAND = "Brand",
  USER = "User",
  LEGAL = "LEGAL",
}

registerEnumType(AddressRelatedTypes, {
  name: "AddressRelatedTypes",
});
