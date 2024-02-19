import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Attribute } from "../entities/attribute.entity";

@ObjectType()
export class PaginationAttributeResponse extends PaginationResponse {
  @Field(() => [Attribute], { nullable: "items" })
  data: Attribute[];
}
