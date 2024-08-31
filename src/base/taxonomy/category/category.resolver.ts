import { Inject, ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { DataSource } from "typeorm";
import { Vocabulary } from "../vocabulary/entities/vocabulary.entity";
import { CategoryService } from "./category.service";
import { CreateCategoryInput } from "./dto/create-category.input";
import { createImageCategoryInput } from "./dto/create-category-image.input";
import { IndexCategoryInput } from "./dto/index-category.input";
import { UpdateCategoryInput } from "./dto/update-category.input";
import { Category } from "./entities/category.entity";
import { User } from "src/users/user/entities/user.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { ImageCategory } from "./entities/category-image.entity";
import { AllCategoryInput } from "./dto/input-category-all.input";
import { PaginationCategoryResponse } from "./dto/pagination-category.response";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CategoryDTO } from "./dto/category-dto";

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}

  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => Category)
  createCategory(
    @Args("createCategoryInput") createCategoryInput: CreateCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.categoryService.create(createCategoryInput, user);
  }
  @Public()
  // @Permission("gql.base.taxonomy.category.store")
  @Query(() => Int, { name: "countDataCategoryAdmin" })
  async countDataAdmin(): Promise<number> {
    return await this.categoryService.countCategories();
  }
  @Public()
  // @Permission("gql.base.taxonomy.category.index")
  @Query(() => PaginationCategoryResponse, { name: "categories" })
  findAll(
    @Args(
      "indexCategoryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexCategoryInput?: IndexCategoryInput,
  ): Promise<PaginationCategoryResponse> {
    return this.categoryService.findPaginate(indexCategoryInput);
  }

  @Public()
  // @Permission("gql.base.taxonomy.category.show")
  @Query(() => Category, { name: "category" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.categoryService.findOne(id, slug);
  }

  @Public()
  // @Permission("gql.base.taxonomy.category.show")
  @Query(() => Category, { name: "categoryAttribuite" })
  findOneAttribuite(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.categoryService.findOneAttribuite(id, slug);
  }

  @Public()
  @Query(() => Category, { name: "admincategory" })
  adminCategory() {
    return this.categoryService.findAdmin();
  }

  @Public()
  @Query(() => [CategoryDTO], { name: "mega_menu" })
  mega_menu() {
    return this.categoryService.getCategories();
  }

  @Public()
  @Query(() => [Category], { name: "allCategoriesV2" })
  allCategoriesV2(
    @Args(
      "indexCategoryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexCategoryInput?: AllCategoryInput,
  ) {
    return this.categoryService.getCategoriesV2(indexCategoryInput);
  }

  @Permission("gql.base.taxonomy.category.update")
  @Mutation(() => Category)
  updateCategory(
    @Args("updateCategoryInput") updateCategoryInput: UpdateCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.categoryService.update(
      updateCategoryInput.id,
      updateCategoryInput,
      user,
    );
  }

  @Permission("gql.base.taxonomy.category.destroy")
  @Mutation(() => Category)
  removeCategory(@Args("id", { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }

  @ResolveField(type => Category)
  parentCategory(@Parent() category: Category): Promise<Category> {
    return this.categoryService.getParentCategoryOf(category);
  }

  @ResolveField(type => [Category])
  children(@Parent() category: Category): Promise<Category[]> {
    return this.categoryService.getChildrenOf(category);
  }

  @ResolveField(returns => Int)
  async childrenCount(@Parent() category: Category): Promise<number> {
    const { id: parentCategoryId } = category;

    const cacheKey = `category_childrenCount_${parentCategoryId}`;

    const cachedCount = await this.cacheManager.get<number>(cacheKey);

    if (cachedCount !== undefined) {
      return cachedCount;
    }

    const count = await this.categoryService.count({ parentCategoryId });

    await this.cacheManager.set(cacheKey, count, CacheTTL.TWO_WEEK);

    return count;
  }

  @ResolveField(returns => Vocabulary)
  async vocabulary(@Parent() category: Category): Promise<Vocabulary> {
    const { vocabularyId } = category;

    const cacheKey = `vocabulary_${vocabularyId}`;

    const cachedVocabulary = await this.cacheManager.get<Vocabulary>(cacheKey);

    if (cachedVocabulary !== undefined) {
      return cachedVocabulary;
    }

    // If not cached, query the database
    const vocabulary = await this.dataSource
      .getRepository(Vocabulary)
      .findOneBy({ id: vocabularyId });

    if (vocabulary) {
      await this.cacheManager.set(cacheKey, vocabulary, CacheTTL.TWO_WEEK);
    }
    return vocabulary;
  }

  @ResolveField(returns => [Category])
  async parentsChain(@Parent() category: Category): Promise<Category[]> {
    return this.categoryService.getParentsChainOf(category);
  }

  @ResolveField(returns => Int)
  async productsCount(@Parent() category: Category): Promise<number> {
    const cacheKey = `category-products-count-${category.id}`;
    let count = await this.cacheManager.get<number>(cacheKey);

    if (count === undefined) {
      count = await this.categoryService.productsCountOf(category);
      await this.cacheManager.set(cacheKey, count, CacheTTL.TWO_WEEK);
    }

    return count;
  }

  @Mutation(() => ImageCategory)
  createCategoryImage(
    @Args("createImageCategory")
    createImageCategoryInput: createImageCategoryInput,
    @CurrentUser() user: User,
  ) {
    return this.categoryService.createImage(createImageCategoryInput, user);
  }
}
