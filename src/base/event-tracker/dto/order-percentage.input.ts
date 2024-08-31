import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class OrderPercentageInput {
  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;
}
