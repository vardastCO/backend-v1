import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import GraphQLJSON from "graphql-type-json";
import { AttributeTypesEnum } from "../enums/attribute-types.enum";

@InputType()
export class CreateAttributeInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  // todo: shape the values
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  values?: object;

  @Field(() => AttributeTypesEnum)
  @IsNotEmpty()
  @IsEnum(AttributeTypesEnum)
  type: AttributeTypesEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  uomId?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsInt({ each: true })
  categoryIds?: number[];

  @Field({ defaultValue: true })
  isPublic: boolean;

  @Field({ defaultValue: false })
  isRequired: boolean;

  @Field({ defaultValue: true })
  isFilterable: boolean;
}
