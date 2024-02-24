import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KavenegarService } from "./kavenegar.service";
import { CronJobService } from "src/cron-job.service";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 3000,
      maxRedirects: 5,
    }),
  ],
  providers: [KavenegarService,CronJobService],
  exports: [KavenegarService],
})
export class KavenegarModule {}
