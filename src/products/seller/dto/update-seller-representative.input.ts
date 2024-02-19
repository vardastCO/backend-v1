import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { CreateSellerRepresentativeInput } from "./create-seller-representative.input";

@InputType()
export class UpdateSellerRepresentativeInput extends PartialType(
  CreateSellerRepresentativeInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;
}
