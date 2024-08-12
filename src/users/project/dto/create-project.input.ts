import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  IsString,
  MaxLength,
} from "class-validator";
import { MultiStatuses } from "../enums/multi-statuses.enum";


@InputType()
export class CreateProjectInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;


  @Field({ nullable: true })
  @IsOptional()
  description?: string;


  @Field(type => MultiStatuses, {
    defaultValue: MultiStatuses.CONFIRMED,
  })
  @IsOptional()
  status: MultiStatuses;


  @Field({ nullable: true })
  @IsOptional()
  wallet?: string;


  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  legalId?: number;  


}
