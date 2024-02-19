import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateAreaInput } from "./create-area.input";

@InputType()
export class UpdateAreaInput extends PartialType(CreateAreaInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
