import { IsInt, IsNotEmpty,IsOptional,IsEnum,IsString,MaxLength } from "class-validator";
import { InputType, Field, Int, PartialType, OmitType } from "@nestjs/graphql";
import { CreatePreOrderInput } from "./create-pre-order.input";

@InputType()
export class UpdatePreOrderInput extends CreatePreOrderInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  
  @Field({ nullable: true })
  need_date: Date;

  
  @Field({ nullable: true })
  bid_start: Date;

  @Field({ nullable: true })
  bid_end: Date;


}
