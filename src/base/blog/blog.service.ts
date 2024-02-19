// blog.service.ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { IndexBlogInput } from "./dto/IndexBlogInput";
import { PaginationBlogResponse } from "./dto/PaginationBlogResponse";
import { Blog } from "./entities/blog.entity";

@Injectable()
export class BlogService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  // constructor(
  //   // @InjectRepository(Blog)
  //   // private readonly blogRepository: Repository<Blog>,
  // ) {}
  // Implement your CRUD operations for blogs here

  async getAllBlogs(
    indexBlogInput?: IndexBlogInput,
  ): Promise<PaginationBlogResponse> {
    try {
      const cacheKey = `blogs_${JSON.stringify(indexBlogInput)}`;
      const cachedData = await this.cacheManager.get<PaginationBlogResponse>(
        cacheKey,
      );

      if (cachedData) {
        return cachedData;
      }

      const response_1 = await axios.get(
        `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=${indexBlogInput.perPage}&_embed&categories=4`,
      );
      const response_2 = await axios.get(
        `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=${indexBlogInput.perPage}&_embed&categories=24`,
      );
      const response_3 = await axios.get(
        `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=${indexBlogInput.perPage}&_embed&categories=6`,
      );

      const data_1 = response_1.data?.slice(0, 1) || [];
      const data_2 = response_2.data?.slice(0, 3) || [];
      const data_3 = response_3.data?.slice(0, 1) || [];

      const posts = [...data_1, ...data_2, ...data_3];

      const createdBlogs: Blog[] = await Promise.all(
        posts.map(async post => {
          const dataUrl = post.guid.rendered;
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
          );

          return newBlog;
        }),
      );

      // Use createdBlogs directly for pagination
      const startIndex = (indexBlogInput.page - 1) * indexBlogInput.perPage;
      const endIndex = startIndex + indexBlogInput.perPage;
      const paginatedBlogs = createdBlogs.slice(0, 5);

      const result: PaginationBlogResponse = PaginationBlogResponse.make(
        indexBlogInput,
        posts.length,
        paginatedBlogs,
      );
      
      // Save the data in the cache
      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

      return result;
    } catch (e) {
      console.log("e", e);
    }
  }

  async createBlog(
    url: string,
    title: string,
    image_url: string,
    description: string,
    categoryId: number,
  ): Promise<Blog> {
    if (title) {
      try {
        let blog = await Blog.findOneBy({
          url: url,
          title: title,
          image_url: image_url,
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
