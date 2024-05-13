import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { MultiTypeOrder } from "src/order/enums/multu-type-order.enum";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";


@ObjectType()
@Entity("order_line")
export class Line extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => PreOrder)
  @ManyToOne(() => PreOrder,{ eager: true })
  preOrder: Promise<PreOrder>;
  @Index()
  @Column()
  pre_order_id: number;

  @Field()
  @Index()
  @Column()
  userId: number;


  @Field()
  @Index()
  @Column({ nullable: true })
  item_name: string;

  
  @Field()
  @Index()
  @Column({ nullable: true })
  attribuite: string;
  
  @Field()
  @Index()
  @Column({ nullable: true })
  uom: string;

  @Field()
  @Index()
  @Column({ nullable: true })
  brand: string;

  @Field()
  @Index()
  @Column({ nullable: true })
  qty: string; 


  @Field()
  @Index()
  @Column({ nullable: true })
  descriptions: string; 



  @Field(() => MultiTypeOrder)
  @Index()
  @Column("enum", {
    enum: MultiTypeOrder,
    default: MultiTypeOrder.PRODUCT,
  })
  type: MultiTypeOrder;

  @Field(() => ThreeStateSupervisionStatuses)
  @Index()
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  @Field()
  @Index()
  @Column({ nullable: true })
  created_at: string;

  @Field()
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 
}
