import { IsInt, IsNotEmpty,IsOptional,IsEnum } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreatePreOrderInput } from "./create-pre-order.input";
import { ExpireTypes } from "../enum/expire-types.enum";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";

@InputType()
export class UpdatePreOrderInput extends PartialType(CreatePreOrderInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => PreOrderStatus, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PreOrderStatus)
  status?: PreOrderStatus;
  
  @Field({ nullable: true })
  need_date: Date;

  @Field(() => ExpireTypes, {
    defaultValue: ExpireTypes.ONE_DAY,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(ExpireTypes)
  expire_date?: ExpireTypes = ExpireTypes.ONE_DAY;

  @Field(() => Int, {
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
