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

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  userId: number;


  @Field({ defaultValue: false })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
