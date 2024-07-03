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
      const cachedData = await this.cacheManager.get<string>(
        cacheKey,
      );

      if (cachedData) {
        const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
        const parsedData: PaginationBlogResponse = JSON.parse(decompressedData);
        return parsedData;
      }

      const [response_1, response_2, response_3] = await Promise.all([
        axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=4'),
        axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=3&_embed&categories=24'),
        axios.get('https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=5')
      ]);
  
      const posts = [
        ...(response_1.data?.slice(0, 1) || []),
        ...(response_2.data?.slice(0, 3) || []),
        ...(response_3.data?.slice(0, 1) || [])
      ];
  
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
  

      // Use createdBlogs directly for pagination
      // const startIndex = (indexBlogInput.page - 1) * indexBlogInput.perPage;
      // const endIndex = startIndex + indexBlogInput.perPage;
      const paginatedBlogs = createdBlogs.slice(0, 5);

      const result: PaginationBlogResponse = PaginationBlogResponse.make(
        indexBlogInput,
        posts.length,
        paginatedBlogs,
      );
      
      const compressedData = zlib.gzipSync(JSON.stringify(result));

      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.TWELVE_HOURS);

      return result;
    } catch (e) {
      console.log("err in blogs", e);
    }
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
