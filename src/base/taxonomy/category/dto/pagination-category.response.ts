import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Category } from "../entities/category.entity";

@ObjectType()
export class PaginationCategoryResponse extends PaginationResponse {
  @Field(() => [Category])
  data: Category[];
}
