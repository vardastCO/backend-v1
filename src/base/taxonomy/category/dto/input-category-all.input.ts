import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class AllCategoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;
}
