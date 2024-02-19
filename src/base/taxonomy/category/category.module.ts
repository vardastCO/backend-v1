import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryResolver } from "./category.resolver";
import CategorySeeder from "./category.seed";
import { CategoryService } from "./category.service";
import { Category } from "./entities/category.entity";
import { FileModule } from "src/base/storage/file/file.module";
import { CategoryController } from "./category.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Category]),FileModule ],
  providers: [CategoryResolver, CategoryService, CategorySeeder],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
