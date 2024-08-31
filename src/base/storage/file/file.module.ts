import { Module } from "@nestjs/common";
import { FileResolver } from "./file.resolver";
import { FileService } from "./file.service";
import { PublicFileController } from "./public-file.controller";
import { PublicFileService } from "./public-file.service";
import { AppFileController } from "./app-file.controller";
import { OrderFileController } from "./order-file.controller";
import { PreOrderFileController } from "./pre-order-file.controller";
import { CsvModule } from "nest-csv-parser";
@Module({
  imports: [CsvModule],
  controllers: [
    PublicFileController,
    AppFileController,
    OrderFileController,
    PreOrderFileController,
  ],
  providers: [PublicFileService, FileResolver, FileService],
  exports: [FileService],
})
export class FileModule {}
