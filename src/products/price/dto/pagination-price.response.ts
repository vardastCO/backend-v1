import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Price } from "../entities/price.entity";

@ObjectType()
export class PaginationPriceResponse extends PaginationResponse {
  @Field(() => [Price], { nullable: "items" })
  data: Price[];
}
