import { Field, InputType, } from "@nestjs/graphql";
import { IsNotEmpty,MaxLength ,IsEnum} from "class-validator";
import {  Length } from "class-validator";
import { TypeUser, } from "../enums/type-user.enum";
@InputType()
export class LoginOTPInput {
  @Field()
  @IsNotEmpty()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;

  
  @Field(() => TypeUser, {
    defaultValue: TypeUser.REAL,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(TypeUser)
  type?: TypeUser = TypeUser.REAL;
}
