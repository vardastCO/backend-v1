import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateFaqInput } from "./create-faq.input";

@InputType()
export class UpdateFaqInput extends CreateFaqInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
