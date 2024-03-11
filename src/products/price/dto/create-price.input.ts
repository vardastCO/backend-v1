import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsEnum
} from "class-validator";
import { PriceTypesEnum } from "../enums/price-types.enum";
import { DiscountTypesEnum } from "../enums/price-discount-types.enum";

@InputType()
export class CreatePriceInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  productId: number;

  
  @Field(() => PriceTypesEnum)
  @IsNotEmpty()
  @IsEnum(PriceTypesEnum)
  type: PriceTypesEnum = PriceTypesEnum.CONSUMER ;

  @Field(() => Int,{ nullable: true })
  @IsInt()
  @IsOptional()
  sellerId?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  attributeValueId: number;

  @Field({ nullable: true })
  @IsBoolean()
  isPublic: boolean = true;

  @Field()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  valueDiscount?: string;


  @Field(() => DiscountTypesEnum, { nullable: true})
  @IsEnum(DiscountTypesEnum)
  @IsOptional()
  typeDiscount?: DiscountTypesEnum;
}
