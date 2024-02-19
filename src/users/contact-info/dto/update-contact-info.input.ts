import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateContactInfoInput } from "./create-contact-info.input";

@InputType()
export class UpdateContactInfoInput extends PartialType(
  CreateContactInfoInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
