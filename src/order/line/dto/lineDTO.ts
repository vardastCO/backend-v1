import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MultiTypeOrder } from "src/order/enums/multu-type-order.enum";

@ObjectType()
export class LineDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  pre_order_id: number;

  @Field(() => String)
  pre_order_uuid: string;

  @Field(() => String)
  project_name: string;

  @Field({ nullable: true })
  expert_name: string;

  @Field({ nullable: true })
  applicant_name: string;

  @Field({ nullable: true })
  need_date: Date;

  @Field({ nullable: true })
  item_name: string;

  @Field({ nullable: true })
  attribuite: string;

  @Field({ nullable: true })
  uom: string;

  @Field({ nullable: true })
  brand: string;

  @Field({ nullable: true })
  qty: string;

  @Field({ nullable: true })
  descriptions: string;

  @Field(() => MultiTypeOrder)
  type: MultiTypeOrder;

  @Field({ nullable: true })
  created_at: string;
}
