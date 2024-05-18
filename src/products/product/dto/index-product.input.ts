import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ProductSortablesEnum } from "../enums/product-sortables.enum";

@InputType()
export class IndexProductInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  query?: string;

  @Field(() => [FilterAttribute], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterAttribute)
  attributes?: FilterAttribute[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  techNum?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  uomId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sellerId?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasPrice?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  createdById?: number;

  
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @Field(() => ProductSortablesEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ProductSortablesEnum)
  orderBy?: ProductSortablesEnum;
}

@InputType()
class FilterAttribute {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;
}
