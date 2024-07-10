import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";



@InputType()
export class IndexLineInput extends IndexInput {

}
