import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AuthStates } from "../enums/auth-states.enum";

@ObjectType()
export class ValidateCellphoneResponse {
  @Field({ nullable: true })
  validationKey?: string;

  @Field(() => Int, { nullable: true })
  remainingSeconds?: number;

  @Field(() => AuthStates)
  nextState: AuthStates;

  @Field()
  message: string;
}
