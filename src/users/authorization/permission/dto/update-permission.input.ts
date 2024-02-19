import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreatePermissionInput } from "./create-permission.input";

@InputType()
export class UpdatePermissionInput extends PartialType(CreatePermissionInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
