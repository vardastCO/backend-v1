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
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";
import { ProductImageStatusEnum } from "../enums/product-imageStatus.enum";
import { ProductPriceStatusEnum } from "../enums/product-priceStatus.enum";
import { ProductSortablesEnum } from "../enums/product-sortables.enum";
import { SortFieldProduct } from "../enums/sort-filed-product.enum";

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

  @Field(() => ProductPriceStatusEnum, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ProductPriceStatusEnum)
  hasPrice?: ProductPriceStatusEnum;

  @Field(() => ProductImageStatusEnum, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ProductImageStatusEnum)
  hasImage?: ProductImageStatusEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  createdById?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @Field(() => SortFieldProduct, {
    defaultValue: SortFieldProduct.RATING,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortFieldProduct)
  sortField?: SortFieldProduct = SortFieldProduct.RATING;

  @Field(() => SortDirection, {
    defaultValue: SortDirection.DESC,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;

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
