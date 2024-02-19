import { IsInt, IsNotEmpty } from "class-validator";
import { CreateDirectoryInput } from "./create-directory.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateDirectoryInput extends PartialType(CreateDirectoryInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
