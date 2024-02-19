import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexProvinceInput extends IndexInput {
  @IsOptional()
  @IsInt()
  @Field({ nullable: true })
  countryId?: number;
}
