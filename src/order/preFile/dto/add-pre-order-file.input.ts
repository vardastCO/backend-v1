
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

  @Field(() => String)
  @IsNotEmpty()
  file_uuid: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  pre_order_id: number;
}
