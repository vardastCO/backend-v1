import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateBlackListInput } from "./create-blackList.input";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

@InputType()
export class UpdateBlackListInput extends PartialType(CreateBlackListInput) {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;
}
