import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { AttributeValue } from "../entities/attribute-value.entity";

@ObjectType()
export class PaginationAttributeValueResponse extends PaginationResponse {
  @Field(() => [AttributeValue], { nullable: "items" })
  data: AttributeValue[];
}
