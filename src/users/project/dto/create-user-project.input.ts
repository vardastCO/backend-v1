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
export class CreateUserProjectInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;


  @Field()
  @IsNotEmpty()
  @IsInt()
  projectId: number;

}
