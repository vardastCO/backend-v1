import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ReportTotalEventsCount {
  @Field(() => Int)
  totalCount: number;
}
