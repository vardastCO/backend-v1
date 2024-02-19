import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateCityInput } from "./create-city.input";

@InputType()
export class UpdateCityInput extends PartialType(CreateCityInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
