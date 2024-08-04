import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { CreateContactInput } from "./create-contact.input";

@InputType()
export class UpdateContactUsInput extends PartialType(CreateContactInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;
}
