
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";
@InputType()
export class AddFilePreOrderInput {

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  file_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  pre_order_id: number;
}
