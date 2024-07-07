import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Line } from "src/order/line/entities/order-line.entity";

@ObjectType()
export class PreOrderDTO {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  uuid: string;

  @Field(() => String,{nullable: true})
  destination: string;

  @Field(() => String,{nullable: true})
  request_date: string;

  @Field(() => Date,{nullable: true})
  need_date?: Date;

  @Field(() => Date,{nullable: true})
  bid_start?: Date;

  @Field(() => Date,{nullable: true})
  bid_end?: Date;

  @Field(() => [Line], { nullable: true })
  lines: Promise<Line[]>;
}


