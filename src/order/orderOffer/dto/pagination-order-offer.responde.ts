import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { OfferOrder } from "../entities/order-offer.entity";


@ObjectType()
export class PaginationOrderOfferResponse extends PaginationResponse {
  @Field(() => [OfferOrder], { nullable: "items" })
  data: OfferOrder[];
}
