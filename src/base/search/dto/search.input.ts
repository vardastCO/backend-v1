import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, MinLength } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class SearchInput extends IndexInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  query: string;
}
