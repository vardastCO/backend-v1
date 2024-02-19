import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";

@InputType()
export class FilterableAttributeInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  attributeId: number;
}
