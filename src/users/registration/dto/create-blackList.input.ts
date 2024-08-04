import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

@InputType()
export class CreateBlackListInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  cellphone: string;

  @Field()
  @IsOptional()
  @IsString()
  reason?: string;
}
