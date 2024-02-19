import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Product } from "../entities/product.entity";

@ObjectType()
export class PaginationProductResponse extends PaginationResponse {
  @Field(() => [Product], { nullable: "items" })
  data: Product[];
}
