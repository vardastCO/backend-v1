import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Blog } from "../entities/blog.entity";

@ObjectType()
export class PaginationBlogResponse extends PaginationResponse {
  @Field(() => [Blog], { nullable: "items" })
  data: Blog[];
}
