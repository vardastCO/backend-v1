import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { ProductEntity } from "../entities/product-service.entity";

@ObjectType()
export class PaginationProductV2Response extends PaginationResponse {
  @Field(() => [ProductEntity], { nullable: "items" })
  data: ProductEntity[];
}
