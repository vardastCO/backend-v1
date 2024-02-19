import { Injectable } from "@nestjs/common";
import { CronJobService } from "./cron-job.service";

@Injectable()
export class AppService {
  constructor(private readonly cronJobService: CronJobService) {}

  getHello(): string {
    return "Hello World!";
  }
}
