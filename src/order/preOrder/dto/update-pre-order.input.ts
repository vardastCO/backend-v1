import { IsInt, IsNotEmpty,IsString,IsEnum } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreatePreOrderInput } from "./create-pre-order.input";
import { ExpireTypes } from "../enum/expire-types.enum";

@InputType()
export class UpdatePreOrderInput extends PartialType(CreatePreOrderInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;


  @Field(() => ExpireTypes, {
    defaultValue: ExpireTypes.ONE_DAY,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(ExpireTypes)
  expire_data?: ExpireTypes = ExpireTypes.ONE_DAY;
}
