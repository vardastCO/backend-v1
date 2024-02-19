import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreateAttributeValueInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  attributeId: number;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  // @IsJSON()
  value: object;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isVariant: boolean;

  // TODO: should be required if `this.isVariant` is true
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sku?: string;
}
