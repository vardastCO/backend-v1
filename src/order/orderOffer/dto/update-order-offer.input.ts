import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,IsString,IsEnum,IsOptional
} from "class-validator";
import { OrderOfferStatuses } from "../enums/order-offer-statuses";
@InputType()
export class UpdateOrderOfferInput {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;

  @Field(() => OrderOfferStatuses, {
    defaultValue: OrderOfferStatuses.CONFIRMED,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(OrderOfferStatuses)
  status?: OrderOfferStatuses = OrderOfferStatuses.CONFIRMED;
  
}