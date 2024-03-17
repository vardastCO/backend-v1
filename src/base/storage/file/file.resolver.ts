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
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { Directory } from "../directory/entities/directory.entity";
import { IndexBannerInput } from "./dto/index-banner.input";
import { IndexFileInput } from "./dto/index-file.input";
import { PaginationFileResponse } from "./dto/pagination-file.response";
import { PresignedUrlObject } from "./dto/presigned-url.response";
import { File } from "./entities/file.entity";
import { FileModelTypeEnum } from "./enums/file-model-type.enum";
import { FileService } from "./file.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  Inject,
} from "@nestjs/common"
import * as zlib from 'zlib';
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
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
  @Query(() => [File])
  async getBannerHomePage(
    @Args("IndexBannerInput") IndexBannerInput: IndexBannerInput,
  ): Promise<File[]> {
    const cacheKey = `banners_${JSON.stringify(IndexBannerInput)}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
    if (cachedData) {
      const decompressedData = zlib.gunzipSync(Buffer.from(cachedData, 'base64')).toString('utf-8');
      const parsedData: File[] = JSON.parse(decompressedData);
  
      return parsedData;
    }
    if (IndexBannerInput.type === FileModelTypeEnum.SLIDER) {
      const response = await File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'Slider',
        },
        order: {
          orderColumn: "ASC",
        }
      });
      const compressedData = zlib.gzipSync(JSON.stringify(response));
      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);
      return  response
    }
    if (IndexBannerInput.type === FileModelTypeEnum.SHORT_BANNER) {
      const response = await File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'ShortBanner',
        },
      });
      const compressedData = zlib.gzipSync(JSON.stringify(response));
      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);
      return  response 
    }

    if (IndexBannerInput.type === FileModelTypeEnum.LONG_BANNER) {
      const response = await File.find({
        where: {
          directory: { path: "banner/mobile" }, //it should be dynamic
          modelType: 'LongBanner',
        },
      });
      const compressedData = zlib.gzipSync(JSON.stringify(response));
      await this.cacheManager.set(cacheKey, compressedData,CacheTTL.ONE_WEEK);
      return  response  
    }

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
