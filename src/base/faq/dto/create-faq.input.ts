import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateFaqInput {
  @Field()
  @IsNotEmpty()
  question: string;

  @Field()
  @IsNotEmpty()
  answer: string;
}
