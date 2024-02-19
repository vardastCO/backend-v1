import { Module } from "@nestjs/common";
import { EventTrackerService } from "./event-tracker.service";
import { EventTrackerResolver } from "./event-tracker.resolver";
import { EventTrackerReportResolver } from "./event-tracker-report.resolver";
import { EventTrackerReportService } from "./event-tracker-report.service";

@Module({
  providers: [
    EventTrackerResolver,
    EventTrackerService,
    EventTrackerReportResolver,
    EventTrackerReportService,
  ],
})
export class EventTrackerModule {}
