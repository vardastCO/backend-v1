import { Field, InputType, Int } from "@nestjs/graphql";
@InputType()
export class CreatePreOrderInput {

  @Field({ nullable: true })
  request_date: string; 

  @Field({ nullable: true })
  expire_date: string; 

  @Field(() => Int,{ nullable: true })
  projectId: number; 

  @Field({ nullable: true })
  payment_methods: string;

  @Field({ nullable: true })
  descriptions: string;
}
