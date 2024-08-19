import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OrderCountResponse {
  @Field(() => [String], { nullable: 'items' })
  labels: string[];

  @Field(() => [[String]], { nullable: 'items' })
  data: string[][];
}

@ObjectType()
export class OrderPercentageResponse {
  @Field(() => String)
  completed_percentage: string;

  @Field(() => String)
  closed_percentage: string;

  @Field(() => String)
  inprogress_percentage: string;
}

@ObjectType()
export class OrderReportChartResponse {
  @Field(() => OrderCountResponse, { nullable: true })
  orderCount: OrderCountResponse;

  @Field(() => OrderPercentageResponse, { nullable: true })
  orderPercent: OrderPercentageResponse;
}
