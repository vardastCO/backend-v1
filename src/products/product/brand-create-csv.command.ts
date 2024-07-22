import { ConfigService } from "@nestjs/config";
import * as Fs from "fs";
import * as Mime from "mime-types";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { Directory } from "src/base/storage/directory/entities/directory.entity";
import { File } from "src/base/storage/file/entities/file.entity";
import { Address } from "src/users/address/entities/address.entity";
import { AddressRelatedTypes } from "src/users/address/enums/address-related-types.enum";
import { EntityManager } from 'typeorm';
import { Brand } from "../brand/entities/brand.entity";
@Command({
  name: "brand:create",
  description: "create brand from given csv file base on official format.",
})
export class BrandCsvCreateCommand extends CommandRunner {
  private headerMap = {
    name: "name",
    sku: "sku",
    address: "address",
    description : "description"
  };

  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";

          const [name,sku,address,description] = attribute;
          return {
            name,
            sku,
            address,
            description
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          return carry;
        }, {});
    },
  };
  constructor(

    private readonly entityManager: EntityManager ,
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  private files: string[];
  private directory: Directory;
  private bucketName: string;
  async setFiles(imageDirectory: string) {
    this.files = imageDirectory ? Fs.readdirSync(imageDirectory) : [];
    this.directory = await Directory.findOneBy({ path: "product/brand/logos" });
    this.bucketName = this.configService.get("STORAGE_MINIO_DEFAULT_BUCKET");
  }
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async run(passedParam: string[], options?: any): Promise<void> {
    const [csvFile, imageDirectory] = passedParam;
    const stream = Fs.createReadStream(csvFile, "utf8");
    await this.setFiles(imageDirectory);
    const csvProducts = await this.csvParser.parse(
      stream,
      CsvProduct,
      null,
      null,
      {
        mapHeaders: ({ header, index }) => this.headerMap[header],
        mapValues: ({ header, index, value }) =>
          this.valueMap.hasOwnProperty(header)
            ? this.valueMap[header](value)
            : value,
        separator: ",",
      },
    );

    for (const csvProduct of csvProducts.list) {

      const {
        name,
        sku,
        address,
        description
      } = csvProduct;

      console.log("sku : ", sku);

      try {
        const find_brand = new Brand()
        find_brand.name = name
        find_brand.bio = description
        find_brand.name_fa = name
        console.log('find brand bio ' , find_brand.bio)
        await find_brand.save()
        try {
          const new_address = new Address()
          new_address.address = address
          new_address.cityId = 1303
          new_address.countryId = 244
          new_address.relatedType = AddressRelatedTypes.BRAND
          new_address.provinceId = 12
          new_address.relatedId = find_brand.id
          new_address.title = 'دفتر'
          await new_address.save()
        } catch (error) {
          console.log('err in address',error)
        }
       
        console.log("files length : ", this.files.length)
        for (const filename of this.files) {
          try {
            const parts = filename.split('-');
            if (parts.length >= 2) {
              const fileSku = parts[0];
              console.log('fileSku',fileSku,sku)
              if (`${fileSku}` == `${sku}`) {
                console.log('fileSku',fileSku)
                const sortOrder = 1;
                const fileRecord = await this.addImage(imageDirectory, filename, find_brand, sortOrder);
            
                find_brand.logoFile = Promise.resolve(fileRecord)
                await find_brand.save();

                await this.delay(100);
              }
              // await this.delay(100);
            }
            console.log('no part lengh 2 ')
          } catch (error) {
            console.log('Warning:', error);
          }
        }
      } catch (e) {
        console.log("Error processing product:", e);
      }
    }

    console.log("All processed.");
  }
  async addImage(
    imageDirectory: string,
    filename: string,
    brand: Brand,
    sort: number,
  ) {
    try {
      const filepath = `${imageDirectory}/${filename}`;
    const file = {
      buffer: Fs.readFileSync(filepath),
      mimetype: Mime.lookup(filepath),
      size: Fs.statSync(filepath).size,
    };

    const randomizedFilename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      modelType: 'Brand',
      name: `${this.directory.path}/${randomizedFilename}`,
      originalName: filename,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
    });
    fileRecord.directory = Promise.resolve(this.directory);
    await fileRecord.save();


    await this.minioClient.putObject(
      this.bucketName,
      fileRecord.name,
      file.buffer,
      {
        "Content-Type": file.mimetype,
        "File-Uuid": fileRecord.uuid,
        "File-Id": fileRecord.id,
      },

      );
    
      return fileRecord
    
    } catch (error) {
      console.log('err in add images',error)
    }
    
  }
}

class CsvProduct {
  name: string;
  sku: string;
  address: string;
  description: string;
}
