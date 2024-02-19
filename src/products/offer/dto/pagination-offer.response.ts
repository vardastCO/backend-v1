import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Offer } from "../entities/offer.entity";

@ObjectType()
export class PaginationOfferResponse extends PaginationResponse {
  @Field(() => [Offer], { nullable: "items" })
  data: Offer[];
}
