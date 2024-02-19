import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateAddressInput } from "./create-address.input";

@InputType()
export class UpdateAddressInput extends PartialType(CreateAddressInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
