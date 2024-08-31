import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { CreateAddressProjectInput } from "./create-address-project.input";

@InputType()
export class UpdateProjectAddressInput extends PartialType(
  CreateAddressProjectInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  addressId: number;
}
