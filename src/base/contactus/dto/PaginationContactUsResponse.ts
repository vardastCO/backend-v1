import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { ContactUs } from "../entities/Contact.entity";

@ObjectType()
export class PaginationContactUsResponse extends PaginationResponse {
  @Field(() => [ContactUs], { nullable: "items" })
  data: ContactUs[];
}
