import { IsInt, IsNotEmpty,IsOptional,IsEnum } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreateLineInput } from "./create-line-order.input";

@InputType()
export class UpdateLineInput extends PartialType(CreateLineInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  
}
