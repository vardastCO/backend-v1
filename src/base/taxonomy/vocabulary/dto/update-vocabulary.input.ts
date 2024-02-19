import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateVocabularyInput } from "./create-vocabulary.input";

@InputType()
export class UpdateVocabularyInput extends PartialType(CreateVocabularyInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
