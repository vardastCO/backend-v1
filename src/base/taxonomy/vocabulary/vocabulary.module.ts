import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryModule } from "../category/category.module";
import { Vocabulary } from "./entities/vocabulary.entity";
import { VocabularyResolver } from "./vocabulary.resolver";
import { VocabularyService } from "./vocabulary.service";

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary]), CategoryModule],
  providers: [VocabularyResolver, VocabularyService],
})
export class VocabularyModule {}
