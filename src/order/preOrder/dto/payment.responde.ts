import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class PaymentResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  callbackUrl?: string;
}
