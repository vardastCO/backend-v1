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
import * as zlib from "zlib";
import { createImageCategoryInput } from "./dto/create-category-image.input";
import { IndexCategoryInput } from "./dto/index-category.input";
import { PaginationCategoryResponse } from "./dto/pagination-category.response";
import { UpdateCategoryInput } from "./dto/update-category.input";
import { ImageCategory } from "./entities/category-image.entity";
import { Category } from "./entities/category.entity";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { CategoryDTO } from "./dto/category-dto";
import { File } from "src/base/storage/file/entities/file.entity";
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
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
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
    const queryBuilder = Category.createQueryBuilder();
    if (indexCatrInput.name) {
      queryBuilder.andWhere("title ILIKE :query", {
        query: `%${indexCatrInput.name}%`,
      });
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

  async getCategories(searchTerm = null): Promise<CategoryDTO[]> {
    const cacheKey = `category_mega_menu`;

    const cachedCategories = await this.cacheManager.get<CategoryDTO[]>(cacheKey);

    if (cachedCategories && Array.isArray(cachedCategories)) {
        // return cachedCategories;
    }

    try {
        const query = `
            SELECT 
                a.id AS level1_id, a.title AS level1_title, a.sort AS level1_sort,
                b.id AS level2_id, b.title AS level2_title, b.sort AS level2_sort,
                c.id AS level3_id, c.title AS level3_title, c.sort AS level3_sort,
                d.id AS level4_id, d.title AS level4_title, d.sort AS level4_sort,
                e.id AS level5_id, e.title AS level5_title, e.sort AS level5_sort
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
            ORDER BY 
                a.sort ASC, b.sort ASC, c.sort ASC, d.sort ASC, e.sort ASC
        `;

        const result = await this.entityManager.query(query);

        async function buildHierarchy(rows): Promise<CategoryDTO[]> {
            const map = {};
            const roots = [];
            const levelOneIds = new Set();

            for (const row of rows) {
                const {
                    level1_id, level1_title,
                    level2_id, level2_title,
                    level3_id, level3_title,
                    level4_id, level4_title,
                    level5_id, level5_title
                } = row;

                function addCategory(id, title, parent) {
                    if (!id) return;
                    if (!map[id]) {
                        map[id] = new CategoryDTO();
                        map[id].id = id;
                        map[id].title = title;
                        map[id].children = [];
                        if (parent) {
                            parent.children.push(map[id]);
                        } else {
                            roots.push(map[id]);
                        }
                    }
                }

                addCategory(level1_id, level1_title, null);
                addCategory(level2_id, level2_title, map[level1_id]);
                addCategory(level3_id, level3_title, map[level2_id]);
                addCategory(level4_id, level4_title, map[level3_id]);
                addCategory(level5_id, level5_title, map[level4_id]);

                levelOneIds.add(level1_id);
            }

            const baseUrl = process.env.STORAGE_MINIO_URL || 'https://storage.vardast.ir/vardast/';
            const processedCategories = {};
            const processCategory = async (level1_id) => {
                if (level1_id in processedCategories) {
                    return;
                }

                processedCategories[level1_id] = true;
                
                try {
                    const category = await Category.findOne({
                        select: ['id', 'imageCategory'],
                        where: { id: level1_id },
                        relations: ['imageCategory']
                    });

                    if (category) {
                        const imageCategories = await category.imageCategory || [];
                        if (imageCategories.length > 0) {
                            const fileId = imageCategories[0]?.fileId;
  
                            if (fileId) {
                                const image = await File.findOneBy({ id: fileId });
               
                                if (image) {
                                    map[level1_id].image_url = `${baseUrl}${image.name}`;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error processing category with ID ${level1_id}:`, error);
                }
            };
            await Promise.all(Array.from(levelOneIds).map(id => processCategory(id)));

            return roots;
        }

        const categories = await buildHierarchy(result);

        await this.cacheManager.set(cacheKey, categories, CacheTTL.ONE_WEEK); 
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
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

    const queryBuilder = Category.createQueryBuilder();
    queryBuilder
      .leftJoinAndSelect(`${queryBuilder.alias}.imageCategory`, "imageCategory")
      .leftJoinAndSelect("imageCategory.file", "file")
      .addSelect(["file.*"])
      .skip(skip)
      .take(take)
      .where(
        Object.fromEntries(
          Object.entries({ parentCategoryId, vocabularyId, isActive }).filter(
            ([_, v]) => v != null,
          ),
        ),
      );
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
      const result = await queryBuilder
        .leftJoinAndSelect(
          `${queryBuilder.alias}.parentCategory`,
          "parentCategory",
        )
        .orderBy(`${queryBuilder.alias}.sort`, "ASC")
        .getMany();
      const jsonString = JSON.stringify(result)
        .replace(/__imageCategory__/g, "imageCategory")
        .replace(/__file__/g, "file")
        .replace(/__parentCategory__/g, "parentCategory");
      // Parse the modified JSON back to objects
      const modifiedDataWithOutText = JSON.parse(jsonString);
      await this.cacheManager.set(
        cacheKey,
        modifiedDataWithOutText,
        CacheTTL.ONE_WEEK,
      ); // Set TTL as needed

      return result;
    } catch (error) {
      // Handle any database query errors here
      throw new Error("Failed to fetch categories: " + error.message);
    }
  }

  async findPaginate(
    indexCategoryInput?: IndexCategoryInput,
  ): Promise<PaginationCategoryResponse> {
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

    const queryBuilder = Category.createQueryBuilder();
    queryBuilder
      .leftJoinAndSelect(`${queryBuilder.alias}.imageCategory`, "imageCategory")
      .leftJoinAndSelect("imageCategory.file", "file")
      .addSelect(["file.*"])
      .skip(skip)
      .take(take)
      .where(
        Object.fromEntries(
          Object.entries({ parentCategoryId, vocabularyId, isActive }).filter(
            ([_, v]) => v != null,
          ),
        ),
      );
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
      const result = await queryBuilder
        .leftJoinAndSelect(
          `${queryBuilder.alias}.parentCategory`,
          "parentCategory",
        )
        .orderBy(`${queryBuilder.alias}.sort`, "ASC")
        .getMany();
      const jsonString = JSON.stringify(result)
        .replace(/__imageCategory__/g, "imageCategory")
        .replace(/__file__/g, "file")
        .replace(/__parentCategory__/g, "parentCategory");
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
    const cacheKey = `category:${id}:${slug || ""}`;
  

    const [cachedCategory, categoryFromDB] = await Promise.all([
      this.cacheManager.get<string>(cacheKey),
      this.categoryRepository.findOneBy({ id, slug })
    ]);
  
    if (cachedCategory) {
      const decompressedData = zlib
        .gunzipSync(Buffer.from(cachedCategory, "base64"))
        .toString("utf-8");
      const parsedData: Category = JSON.parse(decompressedData);
  
      const incrementViewsPromise = this.incrementCategoryViews(parsedData);
      await incrementViewsPromise;
  
      return parsedData;
    }
  
    if (!categoryFromDB) {
      throw new NotFoundException();
    }
  
    const compressedData = zlib.gzipSync(JSON.stringify(categoryFromDB));
    const cachePromise = this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_WEEK);
    
    const incrementViewsPromise = this.incrementCategoryViews(categoryFromDB);
    
    await Promise.all([cachePromise, incrementViewsPromise]);
  
    return categoryFromDB;
  }
  

  async findOneAttribuite(id: number, slug?: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id, slug });
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }
  private async incrementCategoryViews(brand: Category) {
    try {
      await this.entityManager.query(
        `UPDATE base_taxonomy_categories SET views = views + 1 WHERE id = $1`,
        [brand.id]
      );
    } catch (error) {
      console.log('err in incrementCategoryViews',error)
    }
  }
  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
    user: User,
  ): Promise<Category> {
    try {
      const cacheKey = "categories:*";
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
    const cacheKey = `category-count-${JSON.stringify(indexCategoryInput)}`;
    let count = await this.cacheManager.get<number>(cacheKey);

    if (count === undefined) {
      count = await this.categoryRepository.count({ where: indexCategoryInput });
      await this.cacheManager.set(cacheKey, count, CacheTTL.TWO_WEEK);
    }

    return count;
  }

  async getParentCategoryOf(category: Category): Promise<Category> {
    return await category.parentCategory;
  }

  async getParentsChainOf(category: Category): Promise<Category[]> {
    const cacheKey = `category-parents-chain-${category.id}`;
    let parentsChain = await this.cacheManager.get<Category[]>(cacheKey);

    if (parentsChain === undefined) {
      parentsChain = (
        await Category.createQueryBuilder()
          .innerJoin(
            `(select parent_category_ids(${category.id}))`,
            "x",
            "x.parent_category_ids = id",
          )
          .where(`id != ${category.id}`)
          .getMany()
      ).reverse();

      await this.cacheManager.set(cacheKey, parentsChain,CacheTTL.ONE_WEEK); 
    }

    return parentsChain;
  }

  async productsCountOf(category: Category): Promise<number> {
    const cacheKey = `category-products-count-${category.id}`;
    let count = await this.cacheManager.get<number>(cacheKey);
    if (count === undefined) {
      count = await Product.createQueryBuilder()
        .where(`"categoryId" IN (SELECT child_category_ids(:category_id))`, {
          category_id: category.id,
        })
        .getCount();

      await this.cacheManager.set(cacheKey, count, CacheTTL.TWO_WEEK);
    }

    return count;
  
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
