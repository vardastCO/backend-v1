import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Uom } from "../entities/uom.entity";

@ObjectType()
export class PaginationUomResponse extends PaginationResponse {
  @Field(() => [Uom], { nullable: "items" })
  data: Uom[];
}
