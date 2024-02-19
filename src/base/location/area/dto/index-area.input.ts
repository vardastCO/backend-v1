import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsPositive } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexAreaInput extends IndexInput {
  @Field(type => Int, { nullable: true })
  @IsPositive()
  @IsOptional()
  cityId?: number;
}
