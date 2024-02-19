import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { ContactInfo } from "../entities/contact-info.entity";

@ObjectType()
export class PaginationContactInfoResponse extends PaginationResponse {
  @Field(() => [ContactInfo], { nullable: "items" })
  data: ContactInfo[];
}
