import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Permission } from "../entities/permission.entity";

@ObjectType()
export class PaginationPermissionResponse extends PaginationResponse {
  @Field(() => [Permission], { nullable: "items" })
  data: Permission[];
}
