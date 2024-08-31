import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";
@InputType()
export class AddSellerOrderOffer {
  @Field(() => Int)
  @IsNotEmpty()
  orderOfferId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  seller_name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  address: string;
}
