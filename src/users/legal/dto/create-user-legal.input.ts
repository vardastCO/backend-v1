import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";


@InputType()
export class CreateUserLegalInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cellphone: string;


  @Field()
  @IsNotEmpty()
  @IsInt()
  legalId: number;

}
