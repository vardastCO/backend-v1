import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { SellerRepresentative } from "../entities/seller-representative.entity";

@ObjectType()
export class PaginationSellerRepresentativeResponse extends PaginationResponse {
  @Field(() => [SellerRepresentative], { nullable: "items" })
  data: SellerRepresentative[];
}
