import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import * as zlib from 'zlib';
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CategoryService } from "../category/category.service";
import { Category } from "../category/entities/category.entity";
import { CreateVocabularyInput } from "./dto/create-vocabulary.input";
import { IndexVocabularyInput } from "./dto/index-vocabulary.input";
import { PaginationVocabularyResponse } from "./dto/pagination-vocabulary.response";
import { UpdateVocabularyInput } from "./dto/update-vocabulary.input";
import { Vocabulary } from "./entities/vocabulary.entity";
import { VocabularyService } from "./vocabulary.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import {
  Inject,
} from "@nestjs/common";

@Resolver(() => Vocabulary)
export class VocabularyResolver {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly vocabularyService: VocabularyService,
    private readonly categoryService: CategoryService,
  ) {}

  @Permission("gql.base.taxonomy.vocabulary.store")
  @Mutation(() => Vocabulary)
  createVocabulary(
    @Args("createVocabularyInput") createVocabularyInput: CreateVocabularyInput,
  ) {
    return this.vocabularyService.create(createVocabularyInput);
  }

  @Permission("gql.base.taxonomy.vocabulary.index")
  @Query(() => PaginationVocabularyResponse, { name: "vocabularies" })
  async findAll(
    @Args(
      "indexCategoryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexVocabularyInput?: IndexVocabularyInput,
  ) {
    const cacheKey = `vocabularies`;
    const cachedData = await this.cacheManager.get<PaginationVocabularyResponse>(cacheKey);
  
    if (cachedData) {
      return cachedData;
    }
    const response = await  this.vocabularyService.paginate(indexVocabularyInput);

    await this.cacheManager.set(cacheKey, response, 604_800);//one week ?

    return response;
  }

  @Public()
  // @Permission("gql.base.taxonomy.vocabulary.show")
  @Query(() => Vocabulary, { name: "vocabulary" })
  async findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
    @CurrentUser() user: User,
  ) {
    const cacheKey = `vocabulary`;
    const cachedData = await this.cacheManager.get<Vocabulary>(cacheKey);
  
    if (cachedData) {

      return cachedData;
    }
    const response = await this.vocabularyService.findOne(id, slug, user);


    await this.cacheManager.set(cacheKey, response, 604_800);//one week ?

    return response;
  }

  @Permission("gql.base.taxonomy.vocabulary.update")
  @Mutation(() => Vocabulary)
  updateVocabulary(
    @Args("updateVocabularyInput") updateVocabularyInput: UpdateVocabularyInput,
  ) {
    return this.vocabularyService.update(
      updateVocabularyInput.id,
      updateVocabularyInput,
    );
  }

  @Permission("gql.base.taxonomy.vocabulary.destroy")
  @Mutation(() => Vocabulary)
  removeVocabulary(@Args("id", { type: () => Int }) id: number) {
    return this.vocabularyService.remove(id);
  }

  @ResolveField(returns => [Category])
  async categories(@Parent() vocabulary: Vocabulary): Promise<Category[]> {

    const cacheKey = `categories_home_${JSON.stringify(vocabulary)}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {

      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: Category[] = JSON.parse(decompressedData);
  
      const createdCategoriesPromises = parsedData.map(async (categoryData) => {
        const parentCategoryData = categoryData.parentCategory || null;
        const createdCategory: Category = Category.create({
          ...categoryData,
          parentCategory: parentCategoryData,
        });
      
        return createdCategory;
      });
      
      const createdCategories = await Promise.all(createdCategoriesPromises);
      return createdCategories
    }
    const response : Category[] = await this.categoryService.findAll({
      vocabularyId: vocabulary.id,
      onlyRoots: true,
    });
   
    const jsonString = JSON.stringify(response).replace(/__parentCategory__/g, 'parentCategory');

      // Parse the modified JSON back to objects
    const modifiedData = JSON.parse(jsonString);
    const compressedData = zlib.gzipSync(JSON.stringify(modifiedData));
    await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);

    return response;
  }
}
