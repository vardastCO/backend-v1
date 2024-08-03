// blog.service.ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { IndexBlogInput } from "./dto/IndexBlogInput";
import { PaginationBlogResponse } from "./dto/PaginationBlogResponse";
import { Blog } from "./entities/blog.entity";
import * as zlib from 'zlib';
import { EntityManager } from "typeorm";
@Injectable()
export class BlogService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly entityManager: EntityManager,
  ) { }
  // constructor(
  //   // @InjectRepository(Blog)
  //   // private readonly blogRepository: Repository<Blog>,
  // ) {}
  // Implement your CRUD operations for blogs here
  async findTopMostParent(categoryId: number): Promise<number> {
    try {
      const cacheKey = `findTopMostParent:${categoryId}:categories`;
      const cachedData = await this.cacheManager.get<number>(cacheKey);
  
      if (cachedData) {
        return cachedData ;
      }
      let currentCategoryId = categoryId;
      let parentCategoryId = null;
      let loopCounter = 0;
    
      while (currentCategoryId !== null && loopCounter < 4) {
          const result = await this.entityManager.query(
              'SELECT id, "parentCategoryId" FROM base_taxonomy_categories WHERE id = $1',
              [currentCategoryId]
          );
          if (result.length === 0) {
              break;
          }
    
          const category = result[0];
          parentCategoryId = category.parentCategoryId;
          
          if (parentCategoryId === null) {
              return category.id;
          }
    
        currentCategoryId = parentCategoryId;
        loopCounter++;
      }
      await this.cacheManager.set(cacheKey,currentCategoryId,CacheTTL.TWO_WEEK)
      return currentCategoryId;
    } catch (error) {
      console.log('err in findTopMostParent',error)
    }
 
  }
  async getAllBlogs(
    indexBlogInput?: IndexBlogInput,
  ): Promise<PaginationBlogResponse> {
    try {
      console.log(indexBlogInput.categoryId)
      if (indexBlogInput.categoryId) {
        indexBlogInput.categoryId = await this.findTopMostParent(indexBlogInput.categoryId)
      }
      console.log(indexBlogInput.categoryId)
      const cacheKey = `blogs_${JSON.stringify(indexBlogInput)}`;
      const cachedData = await this.cacheManager.get<string>(
        cacheKey,
      );
      let posts 
      if (cachedData) {
        console.log('with cache')
        const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
        const parsedData: PaginationBlogResponse = JSON.parse(decompressedData);
        return parsedData;
      }
      if (indexBlogInput.categoryId) {
        const categoriesParam = this.getCategoryMapping(indexBlogInput.categoryId);
        const [response_1] = await Promise.all([
          axios.get(`https://blog.vardast.com/wp-json/wp/v2/posts?per_page=5&_embed&categories=${categoriesParam}`),
        ]);
    
        posts = [
          ...(response_1.data?.slice(0, 5) || []),
        ];
      } else {
        const [response_1, response_2, response_3] = await Promise.all([
          axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=4'),
          axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=3&_embed&categories=24'),
          axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=5')
        ]);
    
        posts = [
          ...(response_1.data?.slice(0, 1) || []),
          ...(response_2.data?.slice(0, 3) || []),
          ...(response_3.data?.slice(0, 1) || [])
        ];
      }

      const sortedPosts = posts.sort((a, b) => {
        const modifiedDataA = new Date(a.date);
        const modifiedDataB = new Date(b.date);
        if (modifiedDataA > modifiedDataB) {
          return -1;
        }
        if (modifiedDataA < modifiedDataB) {
          return 1;
        }
        return 0;
      })

      const createdBlogs: Blog[] = await Promise.all(
        sortedPosts.map(async post => {
          const dataUrl = post.link;
          const date = post.date;
          const title = post.title.rendered;
          const description = post.excerpt.rendered;
          const categoryId = 1;
          const image_url =
            post?._embedded["wp:featuredmedia"]?.[0]?.media_details?.sizes
              ?.medium_large?.source_url || "";
          const newBlog = await this.createBlog(
            dataUrl,
            title,
            image_url,
            description,
            categoryId,
            date
          );

          return newBlog;
        }),
      );
  
      const paginatedBlogs = createdBlogs.slice(0, 5);

      const result: PaginationBlogResponse = PaginationBlogResponse.make(
        indexBlogInput,
        posts.length,
        paginatedBlogs,
      );
      console.log('no cache')
      const compressedData = zlib.gzipSync(JSON.stringify(result));

      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_DAY);

      return result;
    } catch (e) {
      console.log("err in blogs", e);
    }
  }

  getCategoryMapping(categoryId) {
 
    const mapping = {
        139: 15,
        134: 16,
        106: 8,
        96: 7,
        61: 9,
        69: 10,
        805: 12,
        102: 11,
        117: 14,
        373: 18,
        394: 13,
        1005: 19,
        1: 6,
        789: 17,
    };
    
    return mapping[categoryId] || categoryId;
  }

  async createBlog(
    url: string,
    title: string,
    image_url: string,
    description: string,
    categoryId: number,
    date:string
  ): Promise<Blog> {
    if (title) {
      try {
        let blog = await Blog.findOneBy({
          url: url,
          title: title,
          image_url: image_url,
          date:date
        });

        if (blog) {
          return blog;
        }

        blog = Blog.create({
          url,
          title,
          image_url,
          description,
          categoryId,
          date:date
        });

        await blog.save();
        return blog;
      } catch (error) {
        // Handle the error (e.g., city not found)
        console.error(error);
        throw error; // Rethrow the error or handle it appropriately
      }
    }
  }
}
