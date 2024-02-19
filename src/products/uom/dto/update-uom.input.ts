import { IsInt, IsNotEmpty } from "class-validator";
import { CreateUomInput } from "./create-uom.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateUomInput extends PartialType(CreateUomInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
