import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { CreateSellerInput } from "./create-seller.input";

@InputType()
export class UpdateSellerInput extends PartialType(CreateSellerInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;
}
