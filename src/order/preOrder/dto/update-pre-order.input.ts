import { IsInt, IsNotEmpty,IsOptional,IsEnum } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreatePreOrderInput } from "./create-pre-order.input";
import { ExpireTypes } from "../enum/expire-types.enum";
import { PreOrderStates } from "src/order/enums/pre-order-states.enum";

@InputType()
export class UpdatePreOrderInput extends PartialType(CreatePreOrderInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => PreOrderStates, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PreOrderStates)
  status?: PreOrderStates ;

  @Field(() => ExpireTypes, {
    defaultValue: ExpireTypes.ONE_DAY,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(ExpireTypes)
  expire_date?: ExpireTypes = ExpireTypes.ONE_DAY;
}
