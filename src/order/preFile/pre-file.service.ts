import { Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AddFilePreOrderInput } from "./dto/add-pre-order-file.input";
import { User } from "src/users/user/entities/user.entity";
import { PreOrderFile } from "./entites/pre-order-file.entity";
import { PreOrder } from "../preOrder/entities/pre-order.entity";
import { File } from "src/base/storage/file/entities/file.entity";

@Injectable()
export class PreFileService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async removeFilePreOrder(id: number, user: User): Promise<Boolean> {
    try {
      let files = await PreOrderFile.findOneBy({
        id,
      });
      if (files) {
        await files.remove();
      }
      return true;
    } catch (error) {
      console.log("remove File Pre Order err", error);
      return false;
    }
  }
  async addFilePreOrder(
    addFilePreOrderInput: AddFilePreOrderInput,
    user: User,
  ): Promise<PreOrder> {
    try {
      let files = await File.findOneBy({
        uuid: addFilePreOrderInput.file_uuid,
      });
      const newOrder = new PreOrderFile();
      newOrder.fileId = await files.id;
      newOrder.preOrderId = addFilePreOrderInput.pre_order_id;
      await newOrder.save();

      return await PreOrder.findOne({
        where: { id: addFilePreOrderInput.pre_order_id },
        relations: ["files", "lines"],
      });
    } catch (error) {
      console.log("addFilePreOrder err", error);
      return;
    }
  }
}
