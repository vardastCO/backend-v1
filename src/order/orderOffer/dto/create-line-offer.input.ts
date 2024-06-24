import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,IsString,IsEnum,IsOptional
} from "class-validator";
import {
  Column,
  ManyToOne,
} from "typeorm";
import { TypeOrderOffer } from "src/order/enums/type-order-offer.enum";
@InputType()
export class CreateLineOfferInput {
  @Field(() => Int)
  @IsNotEmpty()
  offerId: number;

  @Field(() => Int)
  @IsNotEmpty()
  lineId: number;



  @Field()
  @IsNotEmpty()
  @IsString()
  fi_price: string;

  @Field(() => TypeOrderOffer, {
    defaultValue: TypeOrderOffer.CLIENT,
  })
  @IsOptional()
  @IsEnum(TypeOrderOffer)
  status: TypeOrderOffer = TypeOrderOffer.CLIENT;

  
  @Field()
  @IsNotEmpty()
  @IsString()
  total_price: string;


  
  @Field()
  @IsNotEmpty()
  @IsString()
  tax_price: string;
}
