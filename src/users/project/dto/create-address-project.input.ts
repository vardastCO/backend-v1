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
export class CreateAddressProjectInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  delivery_name: string;

  @Field()
  @IsNotEmpty()
  @IsInt()
  cityId: number;

  @Field()
  @IsNotEmpty()
  @IsInt()
  province_id: number;


  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  delivery_contact: string;


}
