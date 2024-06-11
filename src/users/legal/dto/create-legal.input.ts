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
export class CreateLegalInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_company: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  national_id: string;



}
