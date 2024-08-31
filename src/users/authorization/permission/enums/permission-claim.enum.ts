import { registerEnumType } from "@nestjs/graphql";

export enum PermissionClaimEnum {
  GENERAL = "GENERAL",
  DASHBOARD = "DASHBOARD",
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  BRAND = "BRAND",
  USER = "USER",
  PROJECT = "PROJECT",
  ORDER = "ORDER",
}

registerEnumType(PermissionClaimEnum, {
  name: "PermissionClaimEnum",
});
