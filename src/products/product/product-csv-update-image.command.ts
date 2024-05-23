import * as Fs from "fs";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { Product } from "src/products/product/entities/product.entity";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { Directory } from "src/base/storage/directory/entities/directory.entity";
import * as Mime from "mime-types";
import { File } from "src/base/storage/file/entities/file.entity";
import { Image } from "../images/entities/image.entity";


@Command({
  name: "product:image",
  description: "image products from given csv file base on official format.",
})
export class ProductCsvUpdateImageCommand extends CommandRunner {
  private headerMap = {
    "productid": "productid",
    "sku":'sku'
  };
 
  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
          .map((attribute) => {
            attribute = attribute ?? "";
            const [ productid,sku] = attribute;
            return {
              productid,
              sku
        
            };
          })
          .filter((a) => a)
          .reduce((carry, cleanAttribute) => {
          
          
          
          return carry;
        }, {});
    },
  };
  constructor(
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
    this.directory = await Directory.findOneBy({ path: "product/image/files" });
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

    try {
      for (const csvProduct of csvProducts.list) {
        try {

        const { productid, sku } = csvProduct;
        let product: Product = await Product.findOneBy({
          sku: sku,
        });
        if (!product) {
          throw product;
        }
 
        const productImages = await product.images;
      
        // Check if the product already has images
        // console.log('first ',productImages,productImages.length)

        // Check if the product already has images
        if (productImages.length != 0) {
          // console.log('Skipped adding images for', product.name, 'as it already has images.');
          continue; // Continue to the next product if images exist
        }
         
        console.log('iiiiiiii',sku)
        let i = 1;
        for (const filename of this.files) {
          try {
            const parts = filename.split('-');
            if (parts.length >= 2) {
              const fileSku = parts[0];
              const sortPart = parts[1].split('.')[0];
              const extension = parts[1].split('.').pop().toLowerCase();

              const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
              if (`${fileSku}` == `${sku}`) {
                console.log('fileSku',fileSku)
                const sortOrder = parseInt(sortPart, 10) || i++;
                await this.addImage(imageDirectory, filename, product, sortOrder);
                await this.delay(100);
              }
              // await this.delay(100);
            }
          } catch (error) {
            console.log('Warning:', error);
          }
        }
          
        } catch (e) {
          console.log('eerr',e)
        }
        
  
        // console.log('Saved', product.name);
      }
    } catch (e) {
      console.log('rrrrrr', e);
    }
  
    console.log("Finished.");
  
  
  }

  async addImage(
    imageDirectory: string,
    filename: string,
    product: Product,
    sort: number,
  ) {
    const filepath = `${imageDirectory}/${filename}`;
    const file = {
      buffer: Fs.readFileSync(filepath),
      mimetype: Mime.lookup(filepath),
      size: Fs.statSync(filepath).size,
    };

    const randomizedFilename = File.generateNewFileName(file);

    const fileRecord: File = File.create<File>({
      modelType: Image.name,
      name: `${this.directory.path}/${randomizedFilename}`,
      originalName: filename,
      size: file.size,
      mimeType: file.mimetype,
      disk: "minio",
      bucketName: this.bucketName,
    });
    fileRecord.directory = Promise.resolve(this.directory);
    await fileRecord.save();

    const image = Image.create({
      productId: product.id,
      fileId: fileRecord.id,
      sort: sort,
    });
    await image.save();

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
  }

}
class CsvProduct {
  name: string;
  category: string;
  brand : string;
}