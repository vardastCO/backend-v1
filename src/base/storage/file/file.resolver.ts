import { CACHE_MANAGER } from "@nestjs/cache-manager";
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
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import * as zlib from 'zlib';
import { Directory } from "../directory/entities/directory.entity";
import { BannerResponse } from "./dto/banner.response";
import { IndexBannerInput } from "./dto/index-banner.input";
import { IndexFileInput } from "./dto/index-file.input";
import { PresignedUrlObject } from "./dto/presigned-url.response";
import { File } from "./entities/file.entity";
import { FileService } from "./file.service";
import { PaginationFileResponse } from "./dto/pagination-file.response";
import { Banner } from "./entities/banners.entity";
@Resolver(() => File)
export class FileResolver {
  constructor(private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,) { }

  @Permission("gql.base.storage.file.index")
  @Query(() => PaginationFileResponse, { name: "files" })
  findAll(
    @Args(
      "indexFileInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexFileInput?: IndexFileInput,
  ) {
    return this.fileService.paginate(indexFileInput);
  }

  @Permission("gql.base.storage.file.show")
  @Query(() => File, { name: "file" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.fileService.findOne(id);
  }
  @Public()
  @Query(() => BannerResponse)
  async getBannerHomePage(
    @Args("IndexBannerInput") IndexBannerInput: IndexBannerInput,
  ): Promise<BannerResponse> {
    const cacheKey = `banners_${JSON.stringify(IndexBannerInput)}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: BannerResponse = JSON.parse(decompressedData);
  
      return parsedData;
    }
    const [small, medium, large, xlarge] = await Promise.all([
      File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'SMALL',
        },
      }),
      File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'MEDIUM',
        },
      }),
      File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'LARGE',
        },
      }),
      File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'XLARGE',
        },
      })
    ]);
  
    const response: BannerResponse = {
      small,
      medium,
      large,
      xlarge
    };
  
    const compressedData = zlib.gzipSync(JSON.stringify(response));
    await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_WEEK);
    return response;

  }
  @Public()
  @Query(() => [Banner])
  async getBanners(
    @Args("IndexBannerInput") IndexBannerInput: IndexBannerInput,
  ): Promise<Banner[]> {
    const cacheKey = `banners_get_${JSON.stringify(IndexBannerInput)}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: Banner[] = JSON.parse(decompressedData);
  
      return parsedData;
    }
    const response = await Banner.find({ take: 5 }); 
    const updatedData = this.replaceKeys(response);
    const compressedData = zlib.gzipSync(JSON.stringify(updatedData));
    await this.cacheManager.set(cacheKey, compressedData, CacheTTL.ONE_WEEK);
    return response;

  }
  replaceKeys(data) {
    return data.map(item => {
        const { __small__, __medium__, __large__, __xlarge__, ...rest } = item;
        return {
            ...rest,
            small: __small__,
            medium: __medium__,
            large: __large__,
            xlarge: __xlarge__
        };
    });
  }


  @Permission("gql.base.storage.file.destroy")
  @Mutation(() => File)
  removeFile(@Args("id", { type: () => Int }) id: number) {
    return this.fileService.remove(id);
  }

  @ResolveField(() => Directory)
  directory(@Parent() file: File): Promise<Directory> {
    return this.fileService.getDirectoryOf(file);
  }

  @ResolveField()
  presignedUrl(@Parent() file: File): Promise<PresignedUrlObject> {
    return this.fileService.getPresignedUrlOf(file);
  }
}
