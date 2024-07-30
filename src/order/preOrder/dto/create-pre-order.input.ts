import { Field, InputType, Int} from "@nestjs/graphql";
import { PaymentMethodEnum } from "../enum/sort-types.enum";
import { IsNotEmpty, IsEnum, IsOptional,Length, IsString, MaxLength, IsInt } from "class-validator";
import { TypeOrder } from "../enum/type-order.enum";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";
import { ExpireTypes } from "../enum/expire-types.enum";

@InputType()
export class CreatePreOrderInput {

  @Field({ nullable: true })
  @IsOptional()
  projectId?: number;

  @Field(() => Int, {
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  addressId?: number;

  @Field(() => PaymentMethodEnum, {
    defaultValue: PaymentMethodEnum.CASH,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  payment_methods?: PaymentMethodEnum = PaymentMethodEnum.CASH;


  @Field({ nullable: true })
  descriptions: string;

  @Field({ nullable: true })
  @IsOptional()
  need_date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  bid_end?: Date;

  @Field({ nullable: true })
  @IsOptional()
  bid_start?: Date;

  @Field(() => TypeOrder, {
    defaultValue: TypeOrder.REAL,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(TypeOrder)
  type?: TypeOrder = TypeOrder.REAL;


  @Field({ nullable: true })
  @IsOptional()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone?: string;

  @Field(() => PreOrderStatus, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(PreOrderStatus)
  status?: PreOrderStatus;
  

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  expert_name?: string;

  @Field(() => String,{nullable:true}) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  applicant_name?: string;


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
