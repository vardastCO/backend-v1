import { Field, InputType, } from "@nestjs/graphql";
import { IsNotEmpty,MaxLength } from "class-validator";
import {  Length } from "class-validator";
@InputType()
export class ChangeNumberInput {
  @Field()
  @IsNotEmpty()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone_new: string;

  @Field()
  @IsNotEmpty()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;
}