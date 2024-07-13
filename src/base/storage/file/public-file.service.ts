import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { User } from "src/users/user/entities/user.entity";
import { DataSource, IsNull } from "typeorm";
import { Directory } from "../directory/entities/directory.entity";
import { CreateFilePublicDto } from "./dto/create-file.public.dto";
import { UpdateFilePublicDto } from "./dto/update-file.public.dto";
import { File } from "./entities/file.entity";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Image } from "src/products/images/entities/image.entity";

@Injectable()
export class PublicFileService {
  protected bucketName: string;

  constructor(
    @InjectMinio() private readonly minioClient: Client,
    private readonly dataSource: DataSource,
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.bucketName = configService.get("STORAGE_MINIO_DEFAULT_BUCKET");
  }

  async create(
    createFileDto: CreateFilePublicDto,
    file: Express.Multer.File,
    user: User,
  ) {
    const directory: Directory = await Directory.findOneBy({
      path: createFileDto.directoryPath,
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : createFileDto?.orderColumn ,
      modelType: createFileDto?.modelType ?? directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);

    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });

      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }

  async uploadCatalogue(
    file: Express.Multer.File,
    user: User,
    brandId: number
  ) {

    // console.log("brand id", brandId);
    // check brand exists
    const brand: Brand = await Brand.findOneBy({id: brandId});
    if (!brand) {
      throw new NotFoundException("Brand Not Found");
    }

    const directory: Directory = await Directory.findOneBy({
      path: 'brand/cataloge',
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    brand.catalog = Promise.resolve(fileRecord);
    // console.log('brand', await brand.catalog)
    try {

         await brand.save();
    } catch (e) {
      console.log('eee',e)
    }

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }
  async uploadBanner(
    file: Express.Multer.File,
    user: User,
    brandId: number
  ) {

    const brand: Brand = await Brand.findOneBy({id: brandId});
    if (!brand) {
      throw new NotFoundException("Brand Not Found");
    }

    const directory: Directory = await Directory.findOneBy({
      path: 'brand/banner',
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    brand.bannerDesktop = Promise.resolve(fileRecord);
    // console.log('brand', await brand.catalog)
    try {

         await brand.save();
    } catch (e) {
      console.log('eee',e)
    }

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }

  async uploadBannerMobile(
    file: Express.Multer.File,
    user: User,
    brandId: number
  ) {

    const brand: Brand = await Brand.findOneBy({id: brandId});
    if (!brand) {
      throw new NotFoundException("Brand Not Found");
    }

    const directory: Directory = await Directory.findOneBy({
      path: 'brand/banner',
    });

    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    brand.bannerMobile = Promise.resolve(fileRecord);
    try {

      await brand.save();
    } catch (e) {
      console.log('err in upload banner',e)
    }

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }

    async uploadSellerLogo(
    file: Express.Multer.File,
    user: User,
    sellerId: number
  ) {

    // console.log("seller Id", sellerId);
    // check brand exists
    const seller: Seller = await Seller.findOneBy({id: sellerId});
    if (!seller) {
      throw new NotFoundException("Seller Not Found");
    }

    const directory: Directory = await Directory.findOneBy({
      path: 'product/seller/logos',
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    seller.logoFile = Promise.resolve(fileRecord);
    // console.log('seller', await seller.logoFile)
    try {
      await seller.save();
    } catch (e) {
      console.log('eee',e)
    }

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

      
    // delete cache
    const cacheKey = `seller_${JSON.stringify(sellerId)}`
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
      console.log("Dellete Cache");
    }
      
    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }


  async uploadBrandPriceList(
    file: Express.Multer.File,
    user: User,
    brandId: number
  ) {

    // check brand exists
    const brand: Brand = await Brand.findOneBy({id: brandId});
    if (!brand) {
      throw new NotFoundException("Brand Not Found");
    }

    const directory: Directory = await Directory.findOneBy({
      path: 'brand/priceList',
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    brand.priceList = Promise.resolve(fileRecord);
    try {

      await brand.save();
    } catch (e) {
      console.log('eee',e)
    }

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }


  async updatePriceList(
    file: Express.Multer.File,
    user: User,
    sellerId: number
  ) {

    const directory: Directory = await Directory.findOneBy({
      path: 'price/update',
    });

    // TODO: check for directory upload permission
    if (!directory) {
      throw new BadRequestException("Specified directory path is invalid!");
    }

    const filename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      name: `${directory.path}/${filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
      orderColumn : 1 ,
      modelType: directory.relatedModel
    });
    fileRecord.directory = Promise.resolve(directory);
    fileRecord.createdBy = Promise.resolve(user);
   
    await this.dataSource.transaction(async () => {
      await fileRecord.save({ transaction: false });
      const uploadedFileInfo = await this.minioClient.putObject(
        this.bucketName,
        fileRecord.name,
        file.buffer,
        {
          "Content-Type": file.mimetype,
          "File-Uuid": fileRecord.uuid,
          "File-Id": fileRecord.id,
        },
      );
    });

    // TODO: add retention for files
    const fileTTL = 3600;
    const oneHourLater = new Date();
    oneHourLater.setSeconds(oneHourLater.getSeconds() + fileTTL);

    await this.cacheManager.set(`pnpm a seller:price ${sellerId} ${fileRecord.id}`, JSON.stringify({'sellerId':sellerId,'file':fileRecord.id}), CacheTTL.THREE_MINUTES);
    
    // await this.minioClient.putObjectRetention(
    //   this.bucketName,
    //   fileRecord.name,
    //   {
    //     versionId: uploadedFileInfo.versionId,
    //     retainUntilDate: oneHourLater.toISOString(),
    //     mode: RETENTION_MODES.COMPLIANCE,
    //   },
    // );

    return {
      uuid: fileRecord.uuid,
      expiresAt: oneHourLater,
    };
  }

  async findOne(uuid: string, user: User): Promise<File> {
    const file = await File.findOneBy({
      uuid,
      modelId: IsNull(),
      // createdById: user.id,
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  update(uuid: string, updateFileDto: UpdateFilePublicDto) {
    return `This action updates a #${uuid} file`;
  }

  async remove(uuid: string, user: User) {
    const file = await this.findOne(uuid, user);
    const image = await Image.findOneBy({ fileId: file.id })
    console.log(image)
    if (image) {
      await Image.delete({ fileId: file.id });
    }

    await this.dataSource.transaction(async () => {
      await this.minioClient.removeObject(this.bucketName, file.name);
      await File.delete({ id: file.id });
    });

    return { uuid };
  }
  async getFileStream(uuid: string): Promise<any> {
    try {
      const files = File.findOneBy({ uuid })
      if (!files) {
        throw 'not found';
      }
      const fileStream = this.minioClient.getObject(this.bucketName, (await files).name);

      return await fileStream;
    } catch (error) {
      console.error(`MinIO Error: ${error.message}`);
      throw error;
    }
  }

  // async getBanner() : Promise<File[] | []> {
  //   const file = await File.find({
  //     where: {
  //       directory: { path: 'banner/mobile' }, //it should be dynamic
  //     },
  //   })
  //   return file 
  // }
}
