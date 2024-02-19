import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";

@InputType()
export class FilterableAttributesInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  categoryId: number;
}
