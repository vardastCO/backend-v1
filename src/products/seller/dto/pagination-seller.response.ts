import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Seller } from "../entities/seller.entity";

@ObjectType()
export class PaginationSellerResponse extends PaginationResponse {
  @Field(() => [Seller], { nullable: "items" })
  data: Seller[];
}
