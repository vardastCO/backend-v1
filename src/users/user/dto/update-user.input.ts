import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty,IsOptional,IsString,MaxLength,Length } from "class-validator";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  // @Field(() => [Int], { nullable: true })
  // @IsOptional()
  // @IsInt({ each: true })
  // roleIds?: number[]; 

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // @MaxLength(255)
  // name_company?: string;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsString()
  // @MaxLength(255)
  // @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  // national_id?: string;
}
