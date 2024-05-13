import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Project } from "../entities/project.entity";

@ObjectType()
export class PaginationProjectResponse extends PaginationResponse {
  @Field(() => [Project], { nullable: "items" })
  data: Project[];
}
