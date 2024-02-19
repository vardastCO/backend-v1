import { Field, InputType, } from "@nestjs/graphql";
import { IsNotEmpty,MaxLength } from "class-validator";

@InputType()
export class LoginOTPInput {
  @Field()
  @IsNotEmpty()
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;
}
