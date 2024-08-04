import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsInt,
  IsOptional,
} from "class-validator";

@InputType()
export class CreateContactInput {

  @Field()
  @IsNotEmpty()
  fullname: string;

  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  cellphone: string;

  @Field()
  @IsNotEmpty()
  text: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  fileId ?: number;
}
