import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { FileService } from "src/base/storage/file/file.service";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Product } from "src/products/product/entities/product.entity";
import { User } from "src/users/user/entities/user.entity";
import { DataSource, EntityManager, IsNull, Repository } from "typeorm";
import { createImageCategoryInput } from "./dto/create-category-image.input";
import { IndexCategoryInput } from "./dto/index-category.input";
import { PaginationCategoryResponse } from "./dto/pagination-category.response";
import { UpdateCategoryInput } from "./dto/update-category.input";
import { ImageCategory } from "./entities/category-image.entity";
import { Category } from "./entities/category.entity";
import * as zlib from 'zlib';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @I18n() protected readonly i18n: I18nService,
    protected dataSource: DataSource,
    private readonly fileService: FileService,
    private readonly entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAdmin() {
    try {
      // Assuming Category is your Sequelize model
      const categoryNames = await Category.createQueryBuilder("category")
        .select(["category.title", "category.id"])
        .getRawMany();

      // Extract only the names from the retrieved categories
      return categoryNames.map(category => category.name);
    } catch (error) {
      // Handle errors here
      console.error("Error fetching categories:", error.message);
      throw error;
    }
  }
  async getCategoriesV2(indexCatrInput): Promise<Category[]> {
    const cacheKey = `find_all_cat_${JSON.stringify(indexCatrInput)}`;

    // Try to get the result from the cache
    const cachedResult = await this.cacheManager.get<Category[]>(cacheKey);
  
    if (cachedResult) {
      return cachedResult;
    }

    // try {
      const queryBuilder = Category.createQueryBuilder()
      if (indexCatrInput.name) {
        queryBuilder.andWhere("title ILIKE :query", { query: `%${indexCatrInput.name}%` });
      }
      
      const result = await queryBuilder
        .select([`${queryBuilder.alias}.id`, `${queryBuilder.alias}.title`])
        .limit(20)
      .getMany();
    
      
      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK); // Set TTL as needed

      return result;
      // try {
      //   const query = `
      //   SELECT 
      //     a.id, 
      //     a.title
      //   FROM 
      //     base_taxonomy_categories a
      // `;

      //   const result = await this.entityManager.query(query);
      //   const categories = result;
      //   await this.cacheManager.set(cacheKey, categories, CacheTTL.ONE_WEEK); // Set TTL as needed

      //   return categories;
      // } catch (error) {
      //   // Handle error appropriately (e.g., log it, throw a custom error)
      //   console.error("Error fetching categories:", error);
      // }
    // }
  }

  async getCategories(searchTerm = null): Promise<Category[]> {
    const cacheKey = `category_v3`;

    const cachedCategories = await this.cacheManager.get<Category[]>(cacheKey);

    if (cachedCategories && Array.isArray(cachedCategories)) {
      return cachedCategories;
    }

    try {
      const query = `
        SELECT 
          a.id, 
          a.title AS level1,
          b.title AS level2,
          c.title AS level3,
          d.title AS level4,
          e.title AS level5
        FROM 
          base_taxonomy_categories a
        LEFT JOIN 
          base_taxonomy_categories b ON a.id = b."parentCategoryId"
        LEFT JOIN 
          base_taxonomy_categories c ON b.id = c."parentCategoryId"
        LEFT JOIN 
          base_taxonomy_categories d ON c.id = d."parentCategoryId"
        LEFT JOIN 
          base_taxonomy_categories e ON d.id = e."parentCategoryId"
        WHERE 
          a."parentCategoryId" IS NULL
      `;

      // if (searchTerm) {
      //   query += `
      //     AND (
      //       a.title = $1
      //       OR b.title = $1
      //       OR c.title = $1
      //       OR d.title = $1
      //       OR e.title = $1
      //     )
      //   `;
      // }
      // const result = await this.entityManager.query(query, [searchTerm]);
      const result = await this.entityManager.query(query);
      const categories = result;
      await this.cacheManager.set(cacheKey, categories, CacheTTL.ONE_WEEK); // Set TTL as needed

      return categories;
    } catch (error) {
      // Handle error appropriately (e.g., log it, throw a custom error)
      console.error("Error fetching categories:", error);
    }
  }
  async create(createCategoryInput, User): Promise<Category> {
    const cacheKey = "categories:*"; // Match all keys starting with 'categories:'
    await this.cacheManager.del(cacheKey);
    const category: Category = await this.categoryRepository.save(
      createCategoryInput,
    );

    const imageCategory: ImageCategory = ImageCategory.create<ImageCategory>();

    if (createCategoryInput.fileUuid) {
      const file = await this.fileService.getNewlyUploadedFileOrFail(
        "product/image/files",
        createCategoryInput.fileUuid,
        "Image",
        User.id,
        await this.i18n.translate("product.image.file_not_found", {
          args: { uuid: createCategoryInput.fileUuid },
        }),
      );

      delete createCategoryInput.fileUuid;

      imageCategory.file = Promise.resolve(file);

      await this.dataSource.transaction(async () => {
        await imageCategory.save({ transaction: false });
        file.modelId = imageCategory.id;
        await file.save({ transaction: false });
      });
    }

    return category;
  }
  async countCategories(): Promise<number> {
    const cacheKey = `countCategories`;
    const cachedCategories = await this.cacheManager.get<number>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }
    const category: number = await this.categoryRepository.count();
    await this.cacheManager.set(cacheKey, category, CacheTTL.ONE_WEEK); 

    return category;
  }

  async findAll(indexCategoryInput?: IndexCategoryInput): Promise<Category[]> {

    const cacheKey = `categories_${JSON.stringify(indexCategoryInput)}`;
    const cachedCategories = await this.cacheManager.get<Category[]>(cacheKey);
    if (cachedCategories && Array.isArray(cachedCategories)) {
      // cachedCategories.forEach(category => {
      //   category.createdAt = new Date(category.createdAt);
      //   category.updatedAt = new Date(category.updatedAt);
      // })
      // return cachedCategories;
    }

    const { take, skip, vocabularyId, isActive, onlyRoots, brandId, sellerId } =
      indexCategoryInput || {};
    const parentCategoryId = onlyRoots
      ? IsNull()
      : indexCategoryInput.parentCategoryId;

    const queryBuilder = Category.createQueryBuilder()
        queryBuilder
        .leftJoinAndSelect(`${queryBuilder.alias}.imageCategory`, 'imageCategory') 
        .leftJoinAndSelect('imageCategory.file', 'file')
        .addSelect(['file.*'])
        .skip(skip)
        .take(take)
        .where(
          Object.fromEntries(
            Object.entries({ parentCategoryId,vocabularyId, isActive }).filter(
              ([_, v]) => v != null,
            ),
          ),
        )
        // .orderBy({ sort: "ASC" });
      

    if (brandId) {
      queryBuilder.andWhere(
        `${queryBuilder.alias}.id in (select distinct "categoryId" from products where "brandId" = :brandId)`,
        { brandId },
      );
    }

    if (sellerId) {
      queryBuilder.andWhere(
        `${queryBuilder.alias}.id in (select distinct "categoryId" from products where id in (select "productId" from product_offers where "sellerId" = :sellerId))`,
        { sellerId },
      );
    }

 
    try {
      const result = await queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.parentCategory`, 'parentCategory')
        .orderBy(`${queryBuilder.alias}.sort`, 'ASC') 
        .getMany(); 
      const jsonString = JSON.stringify(result).replace(/__imageCategory__/g, 'imageCategory')
        .replace(/__file__/g, 'file')
        .replace(/__parentCategory__/g, 'parentCategory')
      ;

      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);
      await this.cacheManager.set(cacheKey, modifiedDataWithOutText, CacheTTL.ONE_WEEK); // Set TTL as needed

      return result;

    } catch (error) {
      // Handle any database query errors here
      throw new Error("Failed to fetch categories: " + error.message);
    }
  }


  async findPaginate(indexCategoryInput?: IndexCategoryInput): Promise<PaginationCategoryResponse> {
    indexCategoryInput.boot();
    // const cacheKey = `categories_find_paginate_${JSON.stringify(indexCategoryInput)}`;
    // const cachedCategories = await this.cacheManager.get<PaginationCategoryResponse>(cacheKey);
    // if (cachedCategories) {
    //   // cachedCategories.forEach(category => {
    //   //   category.createdAt = new Date(category.createdAt);
    //   //   category.updatedAt = new Date(category.updatedAt);
    //   // })
    //   return cachedCategories;
    // }

    const { take, skip, vocabularyId, isActive, onlyRoots, brandId, sellerId } =
      indexCategoryInput || {};
    const parentCategoryId = onlyRoots
      ? IsNull()
      : indexCategoryInput.parentCategoryId;

    const queryBuilder = Category.createQueryBuilder()
        queryBuilder
        .leftJoinAndSelect(`${queryBuilder.alias}.imageCategory`, 'imageCategory') 
        .leftJoinAndSelect('imageCategory.file', 'file')
        .addSelect(['file.*'])
        .skip(skip)
        .take(take)
        .where(
          Object.fromEntries(
            Object.entries({ parentCategoryId,vocabularyId, isActive }).filter(
              ([_, v]) => v != null,
            ),
          ),
        )
        // .orderBy({ sort: "ASC" });
      

    if (brandId) {
      queryBuilder.andWhere(
        `${queryBuilder.alias}.id in (select distinct "categoryId" from products where "brandId" = :brandId)`,
        { brandId },
      );
    }

    if (sellerId) {
      queryBuilder.andWhere(
        `${queryBuilder.alias}.id in (select distinct "categoryId" from products where id in (select "productId" from product_offers where "sellerId" = :sellerId))`,
        { sellerId },
      );
    }

 
    try {
      const result = await queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.parentCategory`, 'parentCategory')
        .orderBy(`${queryBuilder.alias}.sort`, 'ASC') 
        .getMany(); 
      const jsonString = JSON.stringify(result).replace(/__imageCategory__/g, 'imageCategory')
        .replace(/__file__/g, 'file')
        .replace(/__parentCategory__/g, 'parentCategory')
      ;

      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);
      // await this.cacheManager.set(cacheKey, modifiedDataWithOutText, CacheTTL.ONE_WEEK); // Set TTL as needed
      const [data, total] = await queryBuilder.getManyAndCount();

      return PaginationCategoryResponse.make(indexCategoryInput, total, data);
      // return result;

    } catch (error) {
      // Handle any database query errors here
      throw new Error("Failed to fetch categories: " + error.message);
    }
  }

  async paginate(
    indexCategoryInput?: IndexCategoryInput,
  ): Promise<PaginationCategoryResponse> {
    indexCategoryInput.boot();
    const { take, skip, vocabularyId, isActive, onlyRoots, brandId, sellerId } =
      indexCategoryInput || {};
    const parentCategoryId = onlyRoots
      ? IsNull()
      : indexCategoryInput.parentCategoryId || undefined;

    const theQuery = Category.createQueryBuilder()
      .skip(skip)
      .take(take)
      .where(
        Object.fromEntries(
          Object.entries({ parentCategoryId, vocabularyId, isActive }).filter(
            ([_, v]) => v != null,
          ),
        ),
      )
      .orderBy({ sort: "ASC" });

    if (brandId) {
      theQuery.andWhere(
        'id in (select distinct "categoryId" from products where "brandId" = :brandId)',
        { brandId },
      );
    }

    const [data, total] = await theQuery.getManyAndCount();

    return PaginationCategoryResponse.make(indexCategoryInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Category> {
    const cacheKey = `category:${id}:${slug || ''}`;

    const cachedCategory = await this.cacheManager.get<string>(cacheKey);

    // if (cachedCategory) {
    //   const decompressedData = zlib.gunzipSync(Buffer.from(cachedCategory, 'base64')).toString('utf-8');
    //   const parsedData: Category = JSON.parse(decompressedData);

    //   return parsedData;
    // }
    const category = await this.categoryRepository.findOneBy({ id, slug });
    if (!category) {
      throw new NotFoundException();
    }
    console.log('cateeeegory',category)
    const compressedData = zlib.gzipSync(JSON.stringify(category));
    await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);
    return category;
  }

  async findOneAttribuite(id: number, slug?: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id, slug });
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
    user: User,
  ): Promise<Category> {
    try {
      const cacheKey = "categories:*"; // Match all keys starting with 'categories:'
      await this.cacheManager.del(cacheKey);
      const category: Category = await Category.findOne({
        where: { id: updateCategoryInput.id },
      });
      if (!category) {
        throw new NotFoundException();
      }

      category.title = updateCategoryInput?.title;
      category.description = updateCategoryInput?.description;

      category.titleEn = updateCategoryInput?.titleEn;
      category.slug = updateCategoryInput?.slug;

      category.sort = updateCategoryInput?.sort;
      category.parentCategoryId = updateCategoryInput?.parentCategoryId;

      await category.save();

      if (updateCategoryInput.fileUuid) {
        const file = await this.fileService.getNewlyUploadedFileOrFail(
          "product/image/files",
          updateCategoryInput?.fileUuid,
          "Image",
          user.id,
          await this.i18n.translate("product.image.file_not_found", {
            args: { uuid: updateCategoryInput.fileUuid },
          }),
        );
        const data = await ImageCategory.findOne({
          where: {
            categoryId: category.id,
          },
        });
        if (data) {
          data.remove();
        }

        const imageCategory: ImageCategory =
          ImageCategory.create<ImageCategory>();

        delete updateCategoryInput.fileUuid;

        imageCategory.file = Promise.resolve(file);
        imageCategory.category = Promise.resolve(category);

        await imageCategory.save({ transaction: false });
      }
      await this.categoryRepository.save(category);
      return category;
    } catch (e) {}
  }

  async remove(id: number): Promise<Category> {
    let data = await ImageCategory.findOne({
      where: { categoryId: id },
    });
    if (data) {
      await data.remove();
    }

    const category: Category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    category.id = id;
    return category;
  }

  async count(indexCategoryInput: IndexCategoryInput): Promise<number> {
    return await this.categoryRepository.count({ where: indexCategoryInput });
  }

  async getParentCategoryOf(category: Category): Promise<Category> {
    return await category.parentCategory;
  }

  async getParentsChainOf(category: Category): Promise<Category[]> {
    return (
      await Category.createQueryBuilder()
        .innerJoin(
          `(select parent_category_ids(${category.id}))`,
          "x",
          "x.parent_category_ids = id",
        )
        .where(`id != ${category.id}`)
        .getMany()
    ).reverse();
  }

  async productsCountOf(category: Category): Promise<number> {
    return await Product.createQueryBuilder()
      .where(`"categoryId" in (select child_category_ids(:category_id))`, {
        category_id: category.id,
      })
      .getCount();
  }
  async createImage(
    createImageCategoryInput: createImageCategoryInput,
    user: User,
  ): Promise<ImageCategory> {
    const imageCategory: ImageCategory = ImageCategory.create<ImageCategory>(
      createImageCategoryInput,
    );

    const file = await this.fileService.getNewlyUploadedFileOrFail(
      "product/image/files",
      createImageCategoryInput.fileUuid,
      "Image",
      user.id,
      await this.i18n.translate("product.image.file_not_found", {
        args: { uuid: createImageCategoryInput.fileUuid },
      }),
    );

    delete createImageCategoryInput.fileUuid;

    imageCategory.file = Promise.resolve(file);

    await this.dataSource.transaction(async () => {
      await imageCategory.save({ transaction: false });
      file.modelId = imageCategory.id;
      await file.save({ transaction: false });
    });

    return imageCategory;
  }
}
