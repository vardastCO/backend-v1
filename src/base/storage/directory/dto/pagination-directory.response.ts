import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Directory } from "../entities/directory.entity";

@ObjectType()
export class PaginationDirectoryResponse extends PaginationResponse {
  @Field(() => [Directory], { nullable: "items" })
  data: Directory[];
}
