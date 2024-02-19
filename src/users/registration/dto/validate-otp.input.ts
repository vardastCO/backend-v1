import { Field, InputType } from "@nestjs/graphql";
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  Length,
  MaxLength,
} from "class-validator";
import { ValidationTypes } from "../enums/validation-types.enum";

@InputType()
export class ValidateOtpInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;

  @Field()
  @IsNotEmpty()
  @Length(5, 5, { message: "طول رمز یکبار مصرف می‌بایست ۵ کاراکتر باشد." })
  @IsNumberString()
  token: string;

  @Field(() => ValidationTypes, {
    defaultValue: ValidationTypes.SIGNUP,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ValidationTypes)
  validationType?: ValidationTypes = ValidationTypes.SIGNUP;
}
