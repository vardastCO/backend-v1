import { Module } from "@nestjs/common";
import { KavenegarModule } from "src/base/kavenegar/kavenegar.module";
import { ConfigModule } from "../../config/config.module";
import { RegistrationResolver } from "./registration.resolver";
import { RegistrationService } from "./registration.service";

@Module({
  imports: [ConfigModule, KavenegarModule],
  providers: [RegistrationResolver, RegistrationService],
})
export class RegistrationModule {}
