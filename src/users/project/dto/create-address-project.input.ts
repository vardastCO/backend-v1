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
  @IsInt()
  addressId: number;

  @Field()
  @IsNotEmpty()
  @IsInt()
  projectId: number;

}
