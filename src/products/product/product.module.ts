import { Module } from "@nestjs/common";
import { CsvModule } from "nest-csv-parser";
import { ProductCsvSeedCommand } from "./product-csv-seed.command";
import { ProductCsvUpdateCommand } from "./product-csv-update.command";
import { SellerCsvUpdateCommand } from "./seller-csv-update.command";
import { ProductResolver } from "./product.resolver";
import { ProductService } from "./product.service";
import { ProductCsvUpdateImageCommand } from "./product-csv-update-image.command";
import { SellerPriceUpdateCommand } from "./seller-price-csv-update.command";
import { CategoryCsvUpdateFilterCommand } from "./category-attribuite-csv.command";
import { RequiredCsvUpdateFilterCommand } from "./required-attribuite-csv.command";
import { DeleteProductCommand } from "./command/delete-product-csv.command";
import { AttProductValueCommand } from "../attribute-value/command/att-value-csv.command";
import { SeperateProductCommand } from "./command/seperate-product-csv.command";
import { XmlProductCommand } from "./command/generate-xml-product.command";
import { ProductAttribuiteUpdateCommand } from "./product-attribuite-update.command";
import { BrandCsvUpdateCommand } from "./brand-update-csv.command";
// import { ProductExportSeller } from "./product-export-controller";

@Module({
  imports: [CsvModule],
  // controllers: [ProductExportSeller],
  providers: [ProductResolver, ProductService, 
    ProductCsvSeedCommand, ProductCsvUpdateCommand,
    BrandCsvUpdateCommand,
    CategoryCsvUpdateFilterCommand,
    SellerPriceUpdateCommand,
    ProductCsvUpdateImageCommand,
    SellerCsvUpdateCommand,
    RequiredCsvUpdateFilterCommand,
    DeleteProductCommand,
    XmlProductCommand,
    ProductAttribuiteUpdateCommand,
    AttProductValueCommand,
    SeperateProductCommand
  ],
})
export class ProductModule {}
