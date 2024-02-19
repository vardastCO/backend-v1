import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsEnum
} from "class-validator";
import { PriceTypesEnum } from "../enums/price-types.enum";

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
}
