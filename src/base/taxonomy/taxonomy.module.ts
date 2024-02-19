import { Module } from "@nestjs/common";
import { VocabularyModule } from "./vocabulary/vocabulary.module";
import { CategoryModule } from "./category/category.module";

@Module({
  imports: [VocabularyModule, CategoryModule],
})
export class TaxonomyModule {}
