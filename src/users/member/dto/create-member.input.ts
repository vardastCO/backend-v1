import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";

@InputType()
export class CreateMemberInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  relatedId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  position: string;



  @Field({ defaultValue: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
