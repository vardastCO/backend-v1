import { registerEnumType } from "@nestjs/graphql";

export enum SellerType {
  EXTENDED = "EXTENDED",
  NORMAL = "NORMAL",
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}
registerEnumType(SellerType, {
  name: "SellerType",
});
