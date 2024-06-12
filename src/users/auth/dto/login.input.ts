import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty,IsEnum } from "class-validator";
import { TypeUser } from "../enums/type-user.enum";

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  password: string;


  @Field(() => TypeUser, {
    defaultValue: TypeUser.REAL,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(TypeUser)
  type?: TypeUser = TypeUser.REAL;
}
