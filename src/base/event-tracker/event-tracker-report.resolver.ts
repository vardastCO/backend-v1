import { Query, Resolver,Args,Int } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { ReportEventsCountChart } from "./dto/report-events-count-chart.response";
import { ReportTotalEventsCount } from "./dto/report-total-events-count.response";
import { EventTracker } from "./entities/event-tracker.entity";
import { EventTrackerReportService } from "./event-tracker-report.service";

@Resolver(() => EventTracker)
export class EventTrackerReportResolver {
  constructor(
    private readonly eventTrackerReportService: EventTrackerReportService,
  ) {}

  // @Permission("gql.base.event_tracker.report.total_events_count")
  @Query(() => ReportTotalEventsCount, { name: "pastDurationEventsCount" })
  pastDurationTotalEventsCount(
    // @Args("createEventTrackerInput")
    // createEventTrackerInput: CreateEventTrackerInput,
    @CurrentUser() user: User,
  ) {
    return this.eventTrackerReportService.pastDurationTotalEventsCount(user);
  }

  @Permission("gql.base.event_tracker.report.events_chart")
  @Query(() => ReportEventsCountChart, { name: "pastDurationEventsChart" })
  pastDurationEventsChart(@CurrentUser() user: User,
     @Args("sellerId", { type: () => Int, nullable: true }) sellerId?: number,
  ) {
    return this.eventTrackerReportService.pastDurationEventsChart(user,sellerId);
  }
}
