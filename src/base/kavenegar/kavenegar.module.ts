import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KavenegarService } from "./kavenegar.service";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 3000,
      maxRedirects: 5,
    }),
  ],
  providers: [KavenegarService],
  exports: [KavenegarService],
})
export class KavenegarModule {}
