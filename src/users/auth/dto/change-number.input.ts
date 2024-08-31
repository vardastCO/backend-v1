import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, Length, MaxLength } from "class-validator";
import { UserType } from "../enums/type-user.enum";
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

  @Field(() => UserType, {
    defaultValue: UserType.REAL,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(UserType)
  type?: UserType = UserType.REAL;
}
