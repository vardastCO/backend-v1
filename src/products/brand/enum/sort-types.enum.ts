import { registerEnumType } from "@nestjs/graphql";

export enum SortBrandEnum {
  SUM = "sum",
  NEWEST = "newest",
  RATING = "rating",
  VIEW = "views",
}

registerEnumType(SortBrandEnum, { name: "SortBrandEnum" });
