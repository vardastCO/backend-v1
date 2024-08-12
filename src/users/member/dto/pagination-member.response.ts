import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Member } from "../entities/members.entity";

@ObjectType()
export class PaginationMemberResponse extends PaginationResponse {
  @Field(() => [Member], { nullable: "items" })
  data: Member[];
}
