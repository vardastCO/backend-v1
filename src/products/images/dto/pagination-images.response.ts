import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Image } from "../entities/image.entity";

@ObjectType()
export class PaginationImageResponse extends PaginationResponse {
  @Field(() => [Image], { nullable: "items" })
  data: Image[];
}
