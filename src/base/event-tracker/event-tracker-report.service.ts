import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { I18n, I18nService } from "nestjs-i18n";
import { SellerRepresentative } from "src/products/seller/entities/seller-representative.entity";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { DataSource, EntityManager } from "typeorm";
import { OrderPercentageInput } from "./dto/order-percentage.input";
import { OrderCountResponse, OrderPercentageResponse, OrderReportChartResponse } from "./dto/order-percentage.response";
import { ReportEventsCountChart } from "./dto/report-events-count-chart.response";
import { ReportTotalEventsCount } from "./dto/report-total-events-count.response";

@Injectable()
export class EventTrackerReportService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private authorizationService: AuthorizationService,
    private readonly entityManager: EntityManager,
    @I18n() protected readonly i18n: I18nService
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

  async pastDurationEventsChart(user: User,sellerId:number): Promise<ReportEventsCountChart> {
    let params: number[];
    if (sellerId) {
      // If sellerId is provided, find the corresponding userId from SellerRepresentative entity
      const sellerRepresentative = await SellerRepresentative.findOne({ where: { sellerId } });
  
      if (sellerRepresentative) {
        params = [sellerRepresentative.userId];
      } else {
        // Handle the case when sellerId is provided but no corresponding SellerRepresentative is found
        throw new Error('No corresponding SellerRepresentative found for the given sellerId');
      }
    } else {
      // If sellerId is not provided, use the user's id from the passed parameter
      params = [user.id];
    }
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


  async calculateDate(startDate?: Date, endDate?: Date): Promise<{startDateTimestamp: string, endDateTimestamp: string}>{
    if (!endDate) {
      endDate = new Date();
    }

    if (!startDate) {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
    }

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate]
      }
      const timeDiff = endDate.getTime() - startDate.getTime();
      const diffInDays = timeDiff / (1000 * 60 * 60 * 24);
      if (diffInDays > 14) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.ORDER_REPORT_CHARD_INPUT_DATE_IS_NOT_VALID")),
        );
      }
    }

    const startDateTimestamp = startDate.toISOString();
    const endDateTimestamp = endDate.toISOString();
    return {startDateTimestamp, endDateTimestamp}
  }

  async getOrderReport(startDateTimestamp: string, endDateTimestamp: string): Promise<OrderCountResponse> {
    const query = `
        SELECT 
            jyear(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')) || '/' ||
            jmonth(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')) || '/' ||
            jday(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')) AS label, 
            COUNT(*) AS total, 
            COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) AS completed_count,
            COUNT(CASE WHEN po.status = 'CLOSED' THEN 1 END) AS closed_count,
            COUNT(*) - (COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) + COUNT(CASE WHEN po.status = 'CLOSED' THEN 1 END)) AS inProgress_count
        FROM 
            pre_order po
        WHERE 
            TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM') 
            BETWEEN $1  AND $2
        GROUP BY 
            jyear(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')),
            jmonth(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')),
            jday(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM'))
        ORDER BY 
            jyear(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')),
            jmonth(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM')),
            jday(TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM'));
  
    `
    const rows = await this.entityManager.query(
      query,
      [startDateTimestamp, endDateTimestamp]
    );
    const labels: string[] = [];
    const data: string[][] = [[], [], []]; 
    rows.map(row => {
      const { label, completed_count, closed_count, inprogress_count } = row;

        labels.push(label);
        data[0].push(completed_count);
        data[1].push(closed_count);
        data[2].push(inprogress_count);
    });


    return { labels: labels, data: data } as OrderCountResponse
  }

  async getOrderPercentageReport(startDateTimestamp: string, endDateTimestamp: string): Promise<OrderPercentageResponse> {
        const query = `
          SELECT 
              CASE WHEN COUNT(*) > 0 
                  THEN ROUND((COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) * 100.0) / COUNT(*), 2)
                  ELSE 0
              END AS completed_percentage,
              
              CASE WHEN COUNT(*) > 0 
                  THEN ROUND((COUNT(CASE WHEN po.status = 'CLOSED' THEN 1 END) * 100.0) / COUNT(*), 2)
                  ELSE 0
              END AS closed_percentage,
              
              CASE WHEN COUNT(*) > 0 
                  THEN ROUND(((COUNT(*) - (COUNT(CASE WHEN po.status = 'COMPLETED' THEN 1 END) + COUNT(CASE WHEN po.status = 'CLOSED' THEN 1 END))) * 100.0) / COUNT(*), 2)
                  ELSE 0
              END AS inprogress_percentage
          FROM 
              pre_order po
          WHERE 
              TO_TIMESTAMP(po."request_date", 'MM/DD/YYYY, HH:MI:SS AM') 
              BETWEEN $1 AND $2;
    `
    const [percentageRows] = (await this.entityManager.query(
      query,
      [startDateTimestamp, endDateTimestamp]
    ));

    return percentageRows as OrderPercentageResponse;
  }
  

  async orderPecentageChart(orderPercentageInput: OrderPercentageInput): Promise<OrderReportChartResponse> {
    let { startDate, endDate } = orderPercentageInput;

    const {startDateTimestamp, endDateTimestamp} = await this.calculateDate(startDate, endDate)
    
    let report: OrderReportChartResponse = {} as OrderReportChartResponse;
    [report['orderCount'], report['orderPercent']] = await Promise.all([
      this.getOrderReport(startDateTimestamp, endDateTimestamp),
      this.getOrderPercentageReport(startDateTimestamp, endDateTimestamp)
    ]);
 
   return report
  }

}
