import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateProvinceInput } from "./create-province.input";

@InputType()
export class UpdateProvinceInput extends PartialType(CreateProvinceInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
