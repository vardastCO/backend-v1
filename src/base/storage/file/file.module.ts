import { Module } from "@nestjs/common";
import { FileResolver } from "./file.resolver";
import { FileService } from "./file.service";
import { PublicFileController } from "./public-file.controller";
import { PublicFileService } from "./public-file.service";
import { AppFileController } from "./app-file.controller";

@Module({
  controllers: [PublicFileController,AppFileController],
  providers: [PublicFileService, FileResolver, FileService],
  exports: [FileService],
})
export class FileModule {}
