import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty } from "class-validator";
import { UserType } from "../enums/type-user.enum";

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  password: string;


  @Field(() => UserType, {
    defaultValue: UserType.REAL,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(UserType)
  type?: UserType = UserType.REAL;
}
