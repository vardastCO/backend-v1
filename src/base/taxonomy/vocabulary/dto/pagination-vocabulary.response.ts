import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { Vocabulary } from "../entities/vocabulary.entity";

@ObjectType()
export class PaginationVocabularyResponse extends PaginationResponse {
  @Field(() => [Vocabulary], { nullable: "items" })
  data: Vocabulary[];
}
