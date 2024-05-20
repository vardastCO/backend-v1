import { IsInt, IsNotEmpty,IsOptional } from "class-validator";
import { CreateBrandInput } from "./create-brand.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateBrandInput extends PartialType(CreateBrandInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field()
  @IsOptional()
  name_fa: string;

  @Field()
  @IsOptional()
  name_en?: string;
}
