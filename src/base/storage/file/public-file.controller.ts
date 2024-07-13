import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CreateFilePublicDto } from "./dto/create-file.public.dto";
import { UpdateFilePublicDto } from "./dto/update-file.public.dto";
import { PublicFileService } from "./public-file.service";
import * as zlib from 'zlib';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
@Controller("base/storage/file")
export class PublicFileController {
  constructor(private readonly fileService: PublicFileService,
    @InjectMinio() protected readonly minioClient: Client,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  create(
    @Body() createFileDto: CreateFilePublicDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.create(createFileDto, file, user);
  }

  @Post("/brand/catalogue/:id")
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  uploadCatalogue(
    @Param('id') brandId: number, 
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadCatalogue(file, user, brandId);
  }
  @Post("/brand/banner/:id")
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  uploadBannerBrand(
    @Param('id') brandId: number, 
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /png|gif|jpg|jpeg/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadBanner(file, user, brandId);
  }

  @Post("/brand/banner/mobile/:id")
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  uploadBannerBrandMobile(
    @Param('id') brandId: number, 
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /png|gif|jpg|jpeg/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadBannerMobile(file, user, brandId);
  }

  @Post("/brand/priceList/:id")
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  uploadBrandPriceList(
    @Param('id') brandId: number, 
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadBrandPriceList(file, user, brandId);
  }

  @Post("/priceList/update/:id")
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  async updatePriceList(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /csv/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Param('id') sellerId: number, 
    @CurrentUser() user: User,
  ) {
  const allKeys: string[] = await this.cacheManager.store.keys();
  const productKeys: string[] = allKeys.filter(key =>
    key.startsWith("pnpm"),
    );
  if (productKeys.length) {
    return  {};
  }
    return this.fileService.updatePriceList(file, user,sellerId);
  }


  @Post('/seller/logo/:id')
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")   
  uploadSellerLogo(
    @Param('id') sellerId: number, 
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
        })
        .addMaxSizeValidator({ maxSize: 50 * 1_000_000 }) // 50MB
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadSellerLogo(file, user, sellerId);
  }
  
    
  @Patch(":uuid")
  @Permission("rest.base.storage.file.update")
  update(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() updateFileDto: UpdateFilePublicDto,
    @CurrentUser() user: User,
  ) {
    return this.fileService.update(uuid, updateFileDto);
  }

  
  @Get(':uuid')
  async servePdf(@Param("uuid", new ParseUUIDPipe()) uuid: string, @Res() res: Response): Promise<void> {
    try {
      const fileStream = await this.fileService.getFileStream(uuid);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Content-Encoding', 'gzip'); // Set the content encoding to gzip
  
      const gzip = zlib.createGzip(); // Create a gzip stream
  
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        res.status(500).send('Internal Server Error');
      });
  
      fileStream.pipe(gzip).pipe(res);
    } catch (error) {
      // Handle errors, e.g., file not found
      res.status(404).send('File not found');
    }
  }

  @Delete(":uuid")
  @Permission("rest.base.storage.file.destroy")
  remove(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @CurrentUser() user: User,
  ) {
    return this.fileService.remove(uuid, user);
  }

  // @Get()
  // async getBanner() {
  //   const ttlSeconds = 3600;
  
  //   const now = new Date();
  //   now.setSeconds(now.getSeconds() + ttlSeconds);
  
  //   // Call this.fileService.getBanner() and get its result
  //   const bannerData = await this.fileService.getBanner();
  
  //   // Generate presigned URLs for each file in bannerData
  //   const presignedUrls = await Promise.all(
  //     bannerData.map(async (file) => {
  //       const fileUrl = await this.minioClient.presignedGetObject(
  //         file.bucketName,
  //         file.name,
  //         ttlSeconds,
  //       );
  //       return { ...file, url: fileUrl };
  //     })
  //   );
  
  //   return {
  //     expiresAt: now,
  //     bannerData: presignedUrls, // Include presigned URLs for each file
  //   };
  // }
}
