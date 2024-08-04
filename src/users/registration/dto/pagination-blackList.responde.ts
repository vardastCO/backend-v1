import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Blacklist } from "../entities/blacklist.entity";


@ObjectType()
export class PaginationBlackListResponse extends PaginationResponse {
  @Field(() => [Blacklist], { nullable: "items" })
  data: Blacklist[];
}
