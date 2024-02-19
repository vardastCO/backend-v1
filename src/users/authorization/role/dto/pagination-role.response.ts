import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Role } from "../entities/role.entity";

@ObjectType()
export class PaginationRoleResponse extends PaginationResponse {
  @Field(() => [Role], { nullable: "items" })
  data: Role[];
}
