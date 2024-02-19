import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateOfferInput } from "./create-offer.input";

@InputType()
export class UpdateOfferInput extends PartialType(CreateOfferInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
