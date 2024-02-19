import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { User } from "../entities/user.entity";

@ObjectType()
export class PaginationUserResponse extends PaginationResponse {
  @Field(() => [User], { nullable: "items" })
  data: User[];
}
