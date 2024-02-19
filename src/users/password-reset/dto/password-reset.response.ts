import { Field, ObjectType } from "@nestjs/graphql";
import { AuthStates } from "src/users/registration/enums/auth-states.enum";

@ObjectType()
export class PasswordResetResponse {
  @Field()
  message: string;

  @Field(() => AuthStates)
  nextState: AuthStates;
}
