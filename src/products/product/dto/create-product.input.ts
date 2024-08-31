import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { IsUnique } from "src/base/utilities/validations/is-unique.validation";
import { Product } from "../entities/product.entity";
import { ProductTypesEnum } from "../enums/product-types.enum";
import { v4 as uuidv4 } from "uuid";
@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Validate(IsUnique, [Product])
  slug: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  // @Validate(IsUnique, [Product])
  name: string;

  @Field(() => String, { defaultValue: uuidv4() }) // Set default value using uuidv4()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Validate(IsUnique, [Product])
  sku: string;

  @Field(() => ProductTypesEnum)
  @IsNotEmpty()
  @IsEnum(ProductTypesEnum)
  type: ProductTypesEnum;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  brandId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  uomId: number;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @Field(() => ThreeStateSupervisionStatuses)
  @IsNotEmpty()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaDescription: string;
}
