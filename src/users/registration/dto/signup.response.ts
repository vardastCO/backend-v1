import { Field, ObjectType } from "@nestjs/graphql";
import { AuthStates } from "../enums/auth-states.enum";

@ObjectType()
export class SignupResponse {
  @Field()
  message: string;

  @Field(() => AuthStates)
  nextState: AuthStates;
}
