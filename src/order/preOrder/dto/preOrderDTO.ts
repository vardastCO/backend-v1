import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Line } from "src/order/line/entities/order-line.entity";

@ObjectType()
export class OrderDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Date,{nullable: true})
  need_date?: Date;

  @Field(() => [Line], { nullable: true })
  lines: Promise<Line[]>;
}

@ObjectType()
export class PublicPreOrderDTO {
  @Field()
  categoryName: string;

  @Field(type => [OrderDTO])
  orders: OrderDTO[];

  @Field(() => Int)
  categoryId: number;
}

