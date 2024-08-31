import { registerEnumType } from "@nestjs/graphql";

export enum ReferrersEnum {
  CLIENT_VARDAST_IR = "https://client.vardast.ir",
  VARDAST_COM = "https://vardast.com",
  SELLER_IR = "https://seller.vardast.ir",
  SELLER_COM = "https://seller.vardast.com",
  ADMIN_IR = "https://admin.vardast.ir",
  ADMIN_COM = "https://admin.vardast.com",
}

registerEnumType(ReferrersEnum, { name: "ReferrersEnum" });
