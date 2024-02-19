import { Injectable, NotFoundException } from "@nestjs/common";
import { File } from "../file/entities/file.entity";
import { CreateDirectoryInput } from "./dto/create-directory.input";
import { IndexDirectoryInput } from "./dto/index-directory.input";
import { UpdateDirectoryInput } from "./dto/update-directory.input";
import { Directory } from "./entities/directory.entity";
import { PaginationDirectoryResponse } from "./dto/pagination-directory.response";

@Injectable()
export class DirectoryService {
  async create(createDirectoryInput: CreateDirectoryInput): Promise<Directory> {
    const directory: Directory =
      Directory.create<Directory>(createDirectoryInput);
    await directory.save();
    return directory;
  }

  async findAll(
    indexDirectoryInput?: IndexDirectoryInput,
  ): Promise<Directory[]> {
    const { take, skip, relatedModel, relatedProperty } =
      indexDirectoryInput || {};
    return await Directory.find({
      skip,
      take,
      where: { relatedModel, relatedProperty },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexDirectoryInput?: IndexDirectoryInput,
  ): Promise<PaginationDirectoryResponse> {
    indexDirectoryInput.boot();
    const { take, skip, relatedModel, relatedProperty } =
      indexDirectoryInput || {};
    const [data, total] = await Directory.findAndCount({
      skip,
      take,
      where: { relatedModel, relatedProperty },
      order: { id: "DESC" },
    });

    return PaginationDirectoryResponse.make(indexDirectoryInput, total, data);
  }

  async findOne(id: number): Promise<Directory> {
    const directory = await Directory.findOneBy({ id });
    if (!directory) {
      throw new NotFoundException();
    }
    return directory;
  }

  async update(
    id: number,
    updateDirectoryInput: UpdateDirectoryInput,
  ): Promise<Directory> {
    const directory: Directory = await Directory.preload({
      id,
      ...updateDirectoryInput,
    });
    if (!directory) {
      throw new NotFoundException();
    }
    await directory.save();
    return directory;
  }

  async remove(id: number): Promise<Directory> {
    const directory: Directory = await this.findOne(id);
    await directory.remove();
    directory.id = id;
    return directory;
  }

  async getFilesOf(directory: Directory): Promise<File[]> {
    return await directory.files;
  }
}
