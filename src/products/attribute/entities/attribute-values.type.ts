import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class AttributeValues {
  @Field(() => GraphQLJSON, { nullable: true })
  options?: { [key: string]: string };

  @Field(() => [String], { nullable: true })
  defaults?: string[];
}
