import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexAttributeValueInput extends IndexInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  attributeId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVariant?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sku?: string;
}
