import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { CreateMemberInput } from "./create-member.input";

@InputType()
export class UpdateMemberInput extends PartialType(CreateMemberInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;
}
