import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Country } from "../entities/country.entity";

@ObjectType()
export class PaginationCountryResponse extends PaginationResponse {
  @Field(() => [Country], { nullable: "items" })
  data: Country[];
}
