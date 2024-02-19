import { registerEnumType } from "@nestjs/graphql";

export enum SellerRepresentativeRoles {
  ADMIN = "admin",
}
registerEnumType(SellerRepresentativeRoles, {
  name: "SellerRepresentativeRoles",
});
