import { Module } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { FileModule } from "src/base/storage/file/file.module";
import { ImagesResolver } from "./images.resolver";
import { ImagesService } from "./images.service";

@Module({
  imports: [FileModule],
  providers: [ImagesResolver, ImagesService, I18nContext],
})
export class ImagesModule {}
