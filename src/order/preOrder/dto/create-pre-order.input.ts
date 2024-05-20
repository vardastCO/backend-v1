import { Field, InputType, Int} from "@nestjs/graphql";
import { PaymentMethodEnum } from "../enum/sort-types.enum";
import { IsNotEmpty, IsEnum, IsString } from "class-validator";

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
}
