import { DataSource } from "typeorm";
import { Directory } from "../../storage/directory/entities/directory.entity";
import { User } from "src/users/user/entities/user.entity";
import * as fs from "fs";
import { join } from "path";
import { ImageCategory } from "./entities/category-image.entity";
import { Client } from "minio";
import { randomBytes } from "crypto";
import { InjectMinio } from "nestjs-minio";
import { File } from "../../storage/file/entities/file.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import * as Mime from "mime-types";
import { createImageCategoryInput } from "./dto/create-category-image.input";
import { error } from "console";

export default class CategorySeeder {
  constructor(
    @InjectMinio() private readonly minioClient: Client,
    private readonly dataSource: DataSource,
  ) {}

  static generateNewFileName(file: { mimetype: string }): string {
    const extension = file.mimetype.split("/")[1];
    return `${randomBytes(16).toString("hex")}.${extension}`;
  }
  async run(): Promise<any> {
    let directory = await Directory.findOneBy({ id: 5 });

    if (directory) {
      // Create a user object or get an existing user
      const user = await User.findOneBy({ id: 1 });

      const imageDirectory = __dirname + "/img";

      // List image files in the directory

      try {
        const imageFiles = fs.readdirSync(imageDirectory);
        for (const imageFile of imageFiles) {
          try {
            await new Promise(resolve => setTimeout(resolve, 100));
            // Construct the full image file path
            const imagePath = join(imageDirectory, imageFile);

            // Read the image file
            const imageBuffer = fs.readFileSync(imagePath);

            const file = {
              buffer: fs.readFileSync(imagePath),
              mimetype: Mime.lookup(imagePath),
              size: fs.statSync(imagePath).size,
            };
            // console.log('filesssssss',file)

            const randomizedFilename = File.generateNewFileName(file);
            const fileRecord: File = File.create<File>({
              modelType: directory.relatedModel,
              name: `${directory.path}/${randomizedFilename}`,
              originalName: randomizedFilename,
              size: file.size,
              mimeType: file.mimetype,
              disk: "minio",
              bucketName: "vardast",
            });
            fileRecord.directory = Promise.resolve(directory);
            fileRecord.createdBy = Promise.resolve(user);

            await this.dataSource.transaction(async () => {
              await fileRecord.save({ transaction: false });

              // await this.minioClient.putObject(
              //   "vardast",
              //   `${directory.path}/${randomizedFilename}`,
              //   file.buffer,
              //   {
              //     "Content-Type": file.mimetype,
              //     "File-Uuid": fileRecord.uuid,
              //     "File-Id": fileRecord.id,
              //   },
              // );
            });
            try {
              const items = await this.dataSource.manager.query(
                `SELECT *
                FROM base_taxonomy_categories AS category
                WHERE category.title =  '${imageFile.split(".")[0]}'`,
              );
              if (items.length > 0) {
                // Process the result
                const item = items[0];
                try {
                  const imageCategory: ImageCategory =
                    ImageCategory.create<ImageCategory>();
                  imageCategory.file = Promise.resolve(fileRecord);

                  imageCategory.categoryId = item.id;
                  await ImageCategory.save([imageCategory]);

                  // console.log('saved',imageFile.split('.')[0])
                  await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                  console.error(
                    "Error creating ImageCategory using SQL:",
                    error,
                  );
                  // Handle the error as needed
                }
              } else {
                // console.log(imageFile.split('.')[0])
              }

              // try {
              //   let brand: Brand =  await Brand.findOneBy({
              //     name: `${imageFile.split('.')[0]}`,
              //   });
              //   if(!brand){
              //     throw (`${imageFile.split('.')[0]}`)
              //   }
              //   brand.logoFile = Promise.resolve(fileRecord);
              //   // brand.categoryId = item.id;
              //   try {
              //     await brand.save();
              //     console.log('Record saved successfully');
              //   } catch (error) {
              //     console.error('Error saving record:', error);
              //   }

              // } catch (error) {
              //   console.error('Error creating brand using SQL:', error);
              //   // Handle the error as needed
              // }
            } catch (error) {
              console.error("farbooood err", error);
            }
            // Check if a matching category was found
          } catch (e) {
            console.log("errrr", error);
          }
        }
      } catch (e) {
        console.log("fff", e);
      }
    }
  }
}
