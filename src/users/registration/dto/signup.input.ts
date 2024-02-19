import { Field, InputType } from "@nestjs/graphql";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsTimeZone,
  MaxLength,
} from "class-validator";
import { UserLanguagesEnum } from "src/users/user/enums/user-languages.enum";

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  validationKey: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(127)
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

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

  @Field(() => UserLanguagesEnum, {
    nullable: true,
    defaultValue: UserLanguagesEnum.FARSI,
  })
  @IsOptional()
  @IsEnum(UserLanguagesEnum)
  language?: UserLanguagesEnum = UserLanguagesEnum.FARSI;

  @Field(() => String, { nullable: true, defaultValue: "Asia/Tehran" })
  @IsOptional()
  @IsTimeZone()
  timezone? = "Asia/Tehran";
}
