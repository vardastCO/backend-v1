// category.controller.ts
import { Body, Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { QueryCategoryInput } from "./dto/query-category.input";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/all")
  async getCategories(
    @Body() queryCategoryInput: QueryCategoryInput,
  ): Promise<any[]> {
    return this.categoryService.getCategories(queryCategoryInput.query);
  }
}
