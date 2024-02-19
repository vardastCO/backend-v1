import { Field, ObjectType } from "@nestjs/graphql";
import { AuthStates } from "../enums/auth-states.enum";

@ObjectType()
export class ValidateOtpResponse {
  @Field({ nullable: true })
  validationKey?: string;

  @Field(() => AuthStates)
  nextState: AuthStates;

  @Field()
  message: string;
}
