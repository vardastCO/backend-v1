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
        const { productid, sku } = csvProduct;
        let product: Product = await Product.findOneBy({
          sku: sku,
        });
        if (!product) {
          throw product;
        }

        const productImages = await product.images;
      
        // Check if the product already has images


        // Check if the product already has images
        if (productImages && productImages.length > 0) {
          console.log('Skipped adding images for', product.name, 'as it already has images.');
          continue; // Continue to the next product if images exist
        }
        // const productSkus = [sku];
        // const filenameRegex = new RegExp(
        //   `^(${productSkus.join("|")})-(\\d+).(jpg|jpeg|png|webp)$`,
        // );
        let i = 1;

        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

      
        // Construct the regex pattern to match the SKU followed by a hyphen, then a number, and finally the extension
        const filenameRegex = new RegExp(`^${sku}-\\d+\\.(${validExtensions.join('|')})$`, 'i');
    
        for (const filename of this.files) {
          try {
            // Check if the filename matches the regex pattern
            if (filename.match(filenameRegex)) {
              console.log('FOUUUUND')
              const sortOrder = parseInt(filename.split('-')[1], 10) || i++;
      
              // Log details for debugging
              console.log(`Processing file: ${filename}, SKU: ${sku}, sort order: ${sortOrder}, extension: ${extension}`);
      
              // Add the image to the product
              await this.addImage(imageDirectory, filename, product, sortOrder);
      
              // Remove the processed file from the list
              this.files = this.files.filter((file) => file !== filename);
            }
          } catch (error) {
            console.log('Warning:', error);
          }
        }
  
        console.log('Saved', product.name);
      }
    } catch (e) {
      console.log('ERR', e);
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
  sku: string;
}