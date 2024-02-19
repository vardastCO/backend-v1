import { Module } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { FileModule } from "src/base/storage/file/file.module";
import { BrandResolver } from "./brand.resolver";
import { BrandService } from "./brand.service";

@Module({
  imports: [FileModule],
  providers: [BrandResolver, BrandService, I18nContext],
})
export class BrandModule {}
