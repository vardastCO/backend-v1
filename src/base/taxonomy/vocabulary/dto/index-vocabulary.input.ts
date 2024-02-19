import { InputType } from "@nestjs/graphql";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexVocabularyInput extends IndexInput {}
