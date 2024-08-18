import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";
import { TypeOrder } from "../enum/type-order.enum";



@InputType()
export class IndexPreOrderInput extends IndexInput {
  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  projectId?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  customerName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  projectName?: string;

  @Field({ nullable: true })
  @IsOptional()
  hasFile?: Boolean;

  @Field(() => PreOrderStatus, { nullable: true })
  @IsOptional()
  status?: PreOrderStatus;

  @Field(() => TypeOrder, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(TypeOrder)
  typeOrder?: TypeOrder ;
}
