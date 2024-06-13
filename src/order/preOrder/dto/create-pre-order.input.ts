import { Field, InputType, Int} from "@nestjs/graphql";
import { PaymentMethodEnum } from "../enum/sort-types.enum";
import { IsNotEmpty, IsEnum, IsOptional,Length } from "class-validator";
import { TypeOrder } from "../enum/type-order.enum";

@InputType()
export class CreatePreOrderInput {

  @Field(() => Int,{ nullable: true })
  projectId: number; 

  @Field(() => Int,{ nullable: true })
  addressId: number; 

  @Field(() => PaymentMethodEnum, {
    defaultValue: PaymentMethodEnum.CASH,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  payment_methods?: PaymentMethodEnum = PaymentMethodEnum.CASH;


  @Field({ nullable: true })
  descriptions: string;

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
}
