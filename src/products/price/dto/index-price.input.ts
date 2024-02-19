import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsEnum, IsInt, IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { PriceTypesEnum } from "../enums/price-types.enum";

@InputType()
export class IndexPriceInput extends IndexInput {
  @Field(() => Int)
  @IsOptional()
  productId: number;

  @Field(() => PriceTypesEnum, { nullable: true })
  @IsOptional()
  @IsEnum(PriceTypesEnum)
  type?: PriceTypesEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  sellerId: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  createdById: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  attributeValueId: number;
}
