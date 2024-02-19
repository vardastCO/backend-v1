import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Area } from "../entities/area.entity";

@ObjectType()
export class PaginationAreaResponse extends PaginationResponse {
  @Field(() => [Area], { nullable: "items" })
  data: Area[];
}
