import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateProjectInput } from "./create-project.input";

@InputType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
