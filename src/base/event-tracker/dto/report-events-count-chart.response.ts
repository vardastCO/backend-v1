import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ReportEventsCountChart {
  @Field(() => [String], { nullable: "items" })
  labels: string[];

  @Field(() => [Int], { nullable: "items" })
  data: number[];
}
