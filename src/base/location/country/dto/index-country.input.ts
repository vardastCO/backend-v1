import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexCountryInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}
