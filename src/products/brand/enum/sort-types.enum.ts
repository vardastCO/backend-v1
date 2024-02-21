import { registerEnumType } from "@nestjs/graphql";

export enum SortBrandEnum {
  SUM = "sum",
  NEWEST = "newest",
  RATING = "rating",
}

registerEnumType(SortBrandEnum, { name: "SortBrandEnum" });
