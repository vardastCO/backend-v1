
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
export class CreateLineInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  item_name: string;


  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  qty?: string;


  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  uom?: string;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  attribuite?: string;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descriptions?: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  preOrderId: number;
}
