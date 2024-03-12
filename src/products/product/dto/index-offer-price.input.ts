import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexOfferPrice extends IndexInput {

  @Field(() => Int, { nullable: true })
  @IsNotEmpty()
  @IsInt()
  productId?: number;

}
