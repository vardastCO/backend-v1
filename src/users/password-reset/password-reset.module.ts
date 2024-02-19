import { Module } from "@nestjs/common";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { ConfigModule } from "../../config/config.module";
import { UserModule } from "../user/user.module";
import { PasswordResetResolver } from "./password-reset.resolver";
import { PasswordResetService } from "./password-reset.service";

@Module({
  imports: [ConfigModule, KavenegarModule],
  providers: [PasswordResetResolver, PasswordResetService],
})
export class PasswordResetModule {}
