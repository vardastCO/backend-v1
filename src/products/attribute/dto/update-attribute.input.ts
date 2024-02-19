import { IsInt, IsNotEmpty } from "class-validator";
import { CreateAttributeInput } from "./create-attribute.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateAttributeInput extends PartialType(CreateAttributeInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
