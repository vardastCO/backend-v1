import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { File } from "../entities/file.entity";

@ObjectType()
export class PaginationFileResponse extends PaginationResponse {
  @Field(() => [File], { nullable: "items" })
  data: File[];
}
