import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Brand } from "../entities/brand.entity";

@ObjectType()
export class PaginationBrandResponse extends PaginationResponse {
  @Field(() => [Brand], { nullable: "items" })
  data: Brand[];
}
