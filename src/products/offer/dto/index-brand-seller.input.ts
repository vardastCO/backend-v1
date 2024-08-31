import { Field, InputType } from "@nestjs/graphql";
import { IsInt } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexTakeBrandToSeller extends IndexInput {
  @Field()
  @IsInt()
  brandId: number;
}
