import { registerEnumType } from "@nestjs/graphql";

export enum SortFieldProduct {
  RATING = "rating",
  TIME = "createdAt",
  NAME = "name",
  PRICE = "price",
}

registerEnumType(SortFieldProduct, {
  name: "SortFieldProduct",
});
