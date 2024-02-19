import { Image } from "src/products/images/entities/image.entity";
import { User } from "src/users/user/entities/user.entity";
import { Directory } from "./entities/directory.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { ImageCategory } from "src/base/taxonomy/category/entities/category-image.entity";

export default class DirectorySeed {
  private readonly data = [
    {
      path: "user/user/avatars",
      relatedModel: User.name,
      relatedProperty: "avatar",
    },
    {
      path: "product/image/files",
      relatedModel: Image.name,
      relatedProperty: "cat",
    },
    {
      path: "category/image/files",
      relatedModel: ImageCategory.name,
      relatedProperty: "file",
    },
    {
      path: "product/brand/logos",
      relatedModel: Brand.name,
      relatedProperty: "logoFile",
    },
    {
      path: "product/seller/logos",
      relatedModel: Seller.name,
      relatedProperty: "logoFile",
    },
  ];

  async run(): Promise<any> {
    for (const directoryData of this.data) {
      const { path } = directoryData;
      const alreadyExists: boolean = await Directory.createQueryBuilder()
        .where({ path })
        .getExists();
      alreadyExists
        ? await Directory.update({ path }, directoryData)
        : await Directory.save(directoryData);
    }
  }
}
