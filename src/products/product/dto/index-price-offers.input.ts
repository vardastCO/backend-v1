import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexOffersPrice extends IndexInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId?: number;
}
