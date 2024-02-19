import { Module } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { FileModule } from "src/base/storage/file/file.module";
import { UserModule } from "src/users/user/user.module";
import { RepresentativeResolver } from "./representative.resolver";
import { RepresentativeService } from "./representative.service";
import { SellerResolver } from "./seller.resolver";
import { SellerService } from "./seller.service";

@Module({
  imports: [FileModule, KavenegarModule, UserModule],
  providers: [
    SellerResolver,
    SellerService,
    RepresentativeResolver,
    RepresentativeService,
    I18nContext,
  ],
})
export class SellerModule {}
