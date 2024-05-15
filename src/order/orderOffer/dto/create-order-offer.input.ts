import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,
} from "class-validator";
@InputType()
export class CreateOrderOfferInput {
  @Field(() => String)
  @IsNotEmpty()
  total: string;
}
