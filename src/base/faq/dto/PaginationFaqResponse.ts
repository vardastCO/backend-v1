import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { FAQ } from "../entities/faq.entity";

@ObjectType()
export class PaginationFaqResponse extends PaginationResponse {
  @Field(() => [FAQ], { nullable: "items" })
  data: FAQ[];
}
