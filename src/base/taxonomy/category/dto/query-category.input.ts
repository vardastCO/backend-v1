import { Field, InputType, Int } from "@nestjs/graphql";
import {IsOptional } from "class-validator";


@InputType()
export class QueryCategoryInput {
  @Field()
  @IsOptional()
  query?: string;
}
