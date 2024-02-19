import { Field, ObjectType } from "@nestjs/graphql";
import { Attribute } from "src/products/attribute/entities/attribute.entity";

@ObjectType()
export class FilterableAttributeResponse {
  @Field(() => Attribute)
  filter: Attribute;
}
