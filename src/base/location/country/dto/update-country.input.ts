import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateCountryInput } from "./create-country.input";

@InputType()
export class UpdateCountryInput extends PartialType(CreateCountryInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
