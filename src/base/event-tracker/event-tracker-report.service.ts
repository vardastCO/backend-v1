import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { ReportEventsCountChart } from "./dto/report-events-count-chart.response";
import { ReportTotalEventsCount } from "./dto/report-total-events-count.response";

@Injectable()
export class EventTrackerReportService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private authorizationService: AuthorizationService,
  ) {}

  async pastDurationTotalEventsCount(
    user: User,
  ): Promise<ReportTotalEventsCount> {
    let params = [user.id];
    let filterString =
      'AND contacts. "relatedId" in(SELECT "sellerId" FROM product_seller_representatives WHERE "userId" = $1)';
    const rawSql = `
    SELECT
      count(*) AS "totalCount"
    FROM
      base_event_tracker events
      JOIN users_contact_infos contacts ON contacts.id = events. "subjectId"
    WHERE
      "subjectType" = 'ContactInfo'
      AND contacts. "relatedType" = 'Seller'
      :filterString;`;

    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      params = [];
      filterString = "";
    }

    const data = await this.dataSource.query(
      rawSql.replace(":filterString", filterString),
      params,
    );

    return data[0];
  }

  async pastDurationEventsChart(user: User): Promise<ReportEventsCountChart> {
    let params = [user.id];
    let filterString =
      'AND contacts. "relatedId" in(SELECT "sellerId" FROM product_seller_representatives WHERE "userId" = $1)';
    const rawSql = `
    SELECT
      count(*)
      count,
      jyear (events. "createdAt"::date) || '/' || jmonth (events. "createdAt"::date) || '/' || jday (events. "createdAt"::date) label,
      events. "createdAt"::date "date"
    FROM
      base_event_tracker events
      JOIN users_contact_infos contacts ON contacts.id = events. "subjectId"
    WHERE
      "subjectType" = 'ContactInfo'
      AND contacts. "relatedType" = 'Seller'
      :filterString
    GROUP BY
      jyear (events. "createdAt"::date) || '/' || jmonth (events. "createdAt"::date) || '/' || jday (events. "createdAt"::date), events. "createdAt"::date
    ORDER BY
      events. "createdAt"::date ASC;`;

      if (await this.authorizationService.setUser(user).hasRole("admin")) {
        params = [];
        filterString = "";
      }

    const data = await this.dataSource.query(
      rawSql.replace(":filterString", filterString),
      params,
    );

    return data.reduce(
      (carry, current) => {
        carry.data.push(current.count);
        carry.labels.push(current.label);
        return carry;
      },
      { data: [], labels: [] },
    );

    return {
      data: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      ],
      labels: [
        "1402/04/15",
        "1402/04/16",
        "1402/04/17",
        "1402/04/18",
        "1402/04/19",
        "1402/04/20",
        "1402/04/21",
        "1402/04/22",
        "1402/04/23",
        "1402/04/24",
        "1402/04/25",
        "1402/04/26",
        "1402/04/27",
        "1402/04/28",
        "1402/04/29",
        "1402/04/30",
        "1402/05/01",
        "1402/05/02",
        "1402/05/04",
        "1402/05/05",
        "1402/05/06",
        "1402/05/07",
        "1402/05/08",
        "1402/05/09",
        "1402/05/10",
        "1402/05/11",
        "1402/05/12",
        "1402/05/13",
        "1402/05/14",
        "1402/05/15",
      ],
    };
  }
}
