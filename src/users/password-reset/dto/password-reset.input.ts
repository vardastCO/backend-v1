import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from "class-validator";

@InputType()
export class PasswordResetInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        "رمز عبور می‌بایست طولانی‌تر از ۸ کاراکتر و دارای حداقل یک حرف کوچک، یک حرف بزرگ و یک عدد باشد.",
    },
  )
  @MaxLength(127)
  password: string;
}
