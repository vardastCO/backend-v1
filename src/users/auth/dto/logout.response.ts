import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";

@ObjectType()
export class LogoutResponse {
  @Field(() => User)
  user: User;
}
