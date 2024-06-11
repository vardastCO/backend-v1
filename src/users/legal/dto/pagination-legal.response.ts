import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Legal } from "../entities/legal.entity";

@ObjectType()
export class PaginationLegalResponse extends PaginationResponse {
  @Field(() => [Legal], { nullable: "items" })
  data: Legal[];
}
