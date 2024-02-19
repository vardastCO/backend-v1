import { IsInt, IsNotEmpty } from "class-validator";
import { CreateBrandInput } from "./create-brand.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateBrandInput extends PartialType(CreateBrandInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
