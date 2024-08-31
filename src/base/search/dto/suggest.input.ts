import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, MinLength, IsInt, IsOptional } from "class-validator";

@InputType()
export class SuggestInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  query: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  SKU?: number;
}
