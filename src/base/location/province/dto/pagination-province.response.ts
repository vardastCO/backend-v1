import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Province } from "../entities/province.entity";

@ObjectType()
export class PaginationProvinceResponse extends PaginationResponse {
  @Field(() => [Province], { nullable: "items" })
  data: Province[];
}
