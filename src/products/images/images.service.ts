import { Injectable, NotFoundException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { FileService } from "src/base/storage/file/file.service";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { Product } from "../product/entities/product.entity";
import { CreateImageInput } from "./dto/create-image.input";
import { IndexImageInput } from "./dto/index-image.input";
import { PaginationImageResponse } from "./dto/pagination-images.response";
import { UpdateImageInput } from "./dto/update-image.input";
import { Image } from "./entities/image.entity";

@Injectable()
export class ImagesService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    protected dataSource: DataSource,
    private readonly fileService: FileService,
  ) {}

  async create(createImageInput: CreateImageInput, user: User): Promise<Image> {
    const image: Image = Image.create<Image>(createImageInput);

    const file = await this.fileService.getNewlyUploadedFileOrFail(
      "product/image/files",
      createImageInput.fileUuid,
      Image.name,
      user.id,
      await this.i18n.translate("product.image.file_not_found", {
        args: { uuid: createImageInput.fileUuid },
      }),
    );

    delete createImageInput.fileUuid;

    image.file = Promise.resolve(file);

    await this.dataSource.transaction(async () => {
      await image.save({ transaction: false });
      file.modelId = image.id;
      await file.save({ transaction: false });
    });

    return image;
  }

  async findAll(indexImageInput?: IndexImageInput): Promise<Image[]> {
    const { take, skip, productId, isPublic } = indexImageInput || {};
    return await Image.find({
      skip,
      take,
      where: { productId, isPublic },
      order: { sort: "ASC", id: "DESC" },
    });
  }

  async paginate(
    indexImageInput?: IndexImageInput,
  ): Promise<PaginationImageResponse> {
    indexImageInput.boot();
    const { take, skip, productId, isPublic } = indexImageInput || {};
    const [data, total] = await Image.findAndCount({
      skip,
      take,
      where: { productId, isPublic },
      order: { sort: "ASC", id: "DESC" },
    });

    return PaginationImageResponse.make(indexImageInput, total, data);
  }

  async findOne(id: number): Promise<Image> {
    const image = await Image.findOneBy({ id });
    if (!image) {
      throw new NotFoundException();
    }
    return image;
  }

  async update(id: number, updateImageInput: UpdateImageInput): Promise<Image> {
    const image: Image = await Image.preload({
      id,
      ...updateImageInput,
    });
    if (!image) {
      throw new NotFoundException();
    }
    await image.save();
    return image;
  }

  async remove(id: number): Promise<Image> {
    const image: Image = await this.findOne(id);
    await image.remove();
    image.id = id;
    return image;
  }

  async getProductOf(image: Image): Promise<Product> {
    return await image.product;
  }
}
