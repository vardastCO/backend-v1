import { Module } from "@nestjs/common";
import { NestMinioModule } from "nestjs-minio";
import { FileModule } from "./file/file.module";
import { storageAsyncConfig } from "src/config/storage.config";
import { DirectoryModule } from "./directory/directory.module";

@Module({
  imports: [
    NestMinioModule.registerAsync(storageAsyncConfig),
    FileModule,
    DirectoryModule,
  ],
})
export class StorageModule {}
