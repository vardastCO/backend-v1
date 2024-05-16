import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import {
  BaseEntity,
  Column,
  OneToMany,
  Entity,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import { TypeOrderOffer } from "src/order/enums/type-order-offer.enum";
import { OfferLine } from "./offer-line.entity";
import { TempSeller } from "./temp-seller.entity";


@ObjectType()
@Entity("order_offer")
export class OfferOrder extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;


  @Field()
  @Index()
  @Column()
  userId: number;

  @Field(() => PreOrder)
  @ManyToOne(() => PreOrder,{ eager: true })
  preOrder: Promise<PreOrder>;
  @Index()
  @Column()
  preOrderId: number;


  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  request_name: string;

  @ManyToOne(() => TempSeller, { nullable: true, eager: true })
  tempSeller: Promise<TempSeller>;

  @Index()
  @Column({ nullable: true })
  tempSellerId: number;


  @Field({ nullable: true })
  @Column({ nullable: true, default: '0' })
  total?: string;


  @Field(() => TypeOrderOffer)
  @Index()
  @Column("enum", {
    enum: TypeOrderOffer,
    default: TypeOrderOffer.CLIENT,
  })
  type: TypeOrderOffer;
  
  @Field(() => [OfferLine],{nullable:"items"})
  @OneToMany(() => OfferLine, offerLine => offerLine.offerOrder)
  offerLine: OfferLine[];


  @Field(() => ThreeStateSupervisionStatuses)
  @Index()
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.PENDING,
  })
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  created_at: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 
}
