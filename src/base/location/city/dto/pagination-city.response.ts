import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { City } from "../entities/city.entity";

@ObjectType()
export class PaginationCityResponse extends PaginationResponse {
  @Field(() => [City], { nullable: "items" })
  data: City[];
}
