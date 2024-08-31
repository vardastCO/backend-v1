import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt } from "class-validator";
import { IndexInput } from "../../../base/utilities/dto/index.input";

@InputType()
export class IndexSellerBrandInput extends IndexInput {
  @Field(type => Int, { nullable: true })
  @IsInt()
  sellerId: number;
}
