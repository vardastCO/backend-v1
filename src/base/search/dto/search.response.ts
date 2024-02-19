import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationProductResponse } from "src/products/product/dto/pagination-product.response";

@ObjectType()
export class SearchResponse {
  @Field(() => PaginationProductResponse)
  products: PaginationProductResponse;
}
