import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Address } from "../entities/address.entity";

@ObjectType()
export class PaginationAddressResponse extends PaginationResponse {
  @Field(() => [Address], { nullable: "items" })
  data: Address[];
}
