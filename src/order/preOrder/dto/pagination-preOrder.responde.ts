import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { PreOrder } from "../entities/pre-order.entity";


@ObjectType()
export class PaginationPreOrderResponse extends PaginationResponse {
  @Field(() => [PreOrder], { nullable: "items" })
  data: PreOrder[];
}
