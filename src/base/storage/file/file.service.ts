import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { I18n, I18nService } from "nestjs-i18n";
import { InjectMinio } from "nestjs-minio";
import { DeleteResult, In } from "typeorm";
import { Directory } from "../directory/entities/directory.entity";
import { CreateBannerInput } from "./dto/createBannerInput.dto";
import { IndexFileInput } from "./dto/index-file.input";
import { PaginationFileResponse } from "./dto/pagination-file.response";
import { PresignedUrlObject } from "./dto/presigned-url.response";
import {  UpdateBannerInput } from "./dto/updateBannerInput.dto";
import { Banner } from "./entities/banners.entity";
import { File } from "./entities/file.entity";

@Injectable()
export class FileService {
  protected bucketName: string;

  constructor(
    @InjectMinio() protected readonly minioClient: Client,
    @I18n() protected readonly i18n: I18nService,
    configService: ConfigService,
  ) {
    this.bucketName = configService.get("STORAGE_MINIO_DEFAULT_BUCKET");
  }

  async findAll(indexFileInput?: IndexFileInput): Promise<File[]> {
    const { take, skip, directoryId, mimeType, disk, bucketName } =
      indexFileInput || {};
    return await File.find({
      skip,
      take,
      where: { directoryId, mimeType, disk, bucketName },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexFileInput?: IndexFileInput,
  ): Promise<PaginationFileResponse> {
    indexFileInput.boot();
    const { take, skip, directoryId, mimeType, disk, bucketName } =
      indexFileInput || {};
    const [data, total] = await File.findAndCount({
      skip,
      take,
      where: { directoryId, mimeType, disk, bucketName },
      order: { id: "DESC" },
    });

    return PaginationFileResponse.make(indexFileInput, total, data);
  }

  async findOne(id: number): Promise<File> {
    const file = await File.findOneBy({ id });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async remove(id: number): Promise<File> {
    const file: File = await this.findOne(id);
    await this.minioClient.removeObject(file.bucketName, file.name);
    await file.remove();

    file.id = id;
    return file;
  }

  async getDirectoryOf(file: File): Promise<Directory> {
    return await file.directory;
  }

  async createBanner(createBannerInput: CreateBannerInput): Promise<Banner>{
    try {
      const {
        small_uuid,
        large_uuid,
        medium_uuid,
        xlarge_uuid,
        link_url,
        name
      } = createBannerInput;

      const [small, medium, large, xlarge] = await Promise.all([
        File.findOne({
          where: {
            uuid: small_uuid,
          },
        }),
        File.findOne({
          where: {
            uuid: medium_uuid,
          },
        }),
        File.findOne({
          where: {
            uuid: large_uuid,
          },
        }),
        File.findOne({
          where: {
            uuid: xlarge_uuid,
          },
        }),
    ]);

      
      if (!(small && medium && large && xlarge)) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND")),
        );
      }

      const input = {
        smallId :  small.id,
        mediumId :  medium.id,
        largeId :  large.id,
        xlargeId: xlarge.id,
        name : name
      }


      const banner: Banner =  Banner.create<Banner>(input);
      if (link_url) {
        banner.url = link_url
      }
      
      await banner.save();
      return banner;
    } catch (error) {
      console.log("Failed to create banner. Error : " , error);
    }
  }


  async removeBanner(id: number): Promise<Banner>{
    try {
      const banner: Banner = await Banner.findOneBy({ id });
      if (!banner) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND")),
        );
      }
      await banner.remove();
      return banner;
    } catch (error) {
      console.log("Failed to remove banner. Error: ", error);
    }
  }


  async updateBanner(id: number, updateBannerInput: UpdateBannerInput): Promise<Banner> {
    try {

      const banner = await Banner.findOne({ where: { id } });
      if (!banner) {
        throw new BadRequestException(await this.i18n.translate("exceptions.NOT_FOUND"));
      }
  
      const { small_uuid, large_uuid, medium_uuid, xlarge_uuid, link_url,name } = updateBannerInput;
  
      const files = await File.find({
        where: { uuid: In([small_uuid, medium_uuid, large_uuid, xlarge_uuid]) }
      });
  
      const fileMap = new Map(files.map(file => [file.uuid, file]));
  
      if (small_uuid && fileMap.has(small_uuid)) {
        banner.smallId = fileMap.get(small_uuid)?.id;
      }
      if (medium_uuid && fileMap.has(medium_uuid)) {
        banner.mediumId = fileMap.get(medium_uuid)?.id;
      }
      if (large_uuid && fileMap.has(large_uuid)) {
        banner.largeId = fileMap.get(large_uuid)?.id;
      }
      if (xlarge_uuid && fileMap.has(xlarge_uuid)) {
        banner.xlargeId = fileMap.get(xlarge_uuid)?.id;
      }
      if (link_url) {
        banner.url = link_url;
      }

      if (name) {
        banner.name = name;
      }
  
      await banner.save();
  
      return banner;
    } catch (error) {
      console.error("Failed to update Banner. Error: ", error);
    }
  }
  
  
  
  async getPresignedUrlOf(file: File): Promise<PresignedUrlObject> {
    const now = new Date();
    const baseUrl = process.env.STORAGE_MINIO_URL || 'https://storage.vardast.ir/vardast/';
    const url = `${baseUrl}${file.name}`

    return {
      url: url,
      expiresAt: now,
    };
  }

  async getNewlyUploadedFileOrFail(
    directory: string,
    uuid: string,
    modelType: string,
    createdById: number,
    customErrorMessageOnFailure?: string,
  ): Promise<File> {
    const file = await File.getNewlyUploadedFile(
      directory,
      uuid,
      modelType,
      createdById,
    );

    if (!file) {
      throw new BadRequestException(
        customErrorMessageOnFailure ??
          (await this.i18n.translate("storage.file.not_found", {
            args: { uuid },
          })),
      );
    }

    return file;
  }

  async removeFromStorageAndDB(file: File): Promise<[void, DeleteResult]> {
    return [
      await this.minioClient.removeObject(file.bucketName, file.name),
      await File.delete({ id: file.id }),
    ];
  }
}
