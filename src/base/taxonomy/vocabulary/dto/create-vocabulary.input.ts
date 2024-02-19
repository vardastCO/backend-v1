import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { IsUnique } from "../../../utilities/validations/is-unique.validation";
import { Country } from "../../../location/country/entities/country.entity";
import { Vocabulary } from "../entities/vocabulary.entity";

@InputType()
export class CreateVocabularyInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  titleEn?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Vocabulary])
  slug: string;

  // TODO: change default value to SQL: currval('base_taxonomy_vocabularies_id_seq')
  @Field(() => Int)
  @IsNotEmpty()
  sort: number = 0;
}
