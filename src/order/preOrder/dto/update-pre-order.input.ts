import { IsInt, IsNotEmpty,IsString,IsOptional } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreatePreOrderInput } from "./create-pre-order.input";

@InputType()
export class UpdatePreOrderInput extends PartialType(CreatePreOrderInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

}
