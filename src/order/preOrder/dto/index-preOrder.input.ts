import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { PreOrderStates } from "src/order/enums/pre-order-states.enum";



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

  @Field(() => PreOrderStates, { nullable: true })
  @IsOptional()
  status?: PreOrderStates;
}
