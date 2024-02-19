import { Field, InputType, Int } from "@nestjs/graphql";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexCityInput extends IndexInput {
  @Field(type => Int, { nullable: true })
  provinceId?: number;

  @Field(type => Int, { nullable: true })
  parentCityId?: number;
}
