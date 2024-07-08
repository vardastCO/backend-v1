import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TypeOrderOffer } from "src/order/enums/type-order-offer.enum";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { OrderOfferStatuses } from "../enums/order-offer-statuses";
import { OfferLine } from "./offer-line.entity";
import { ModelOffer } from "src/order/enums/model-offer.enum";


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

  @Field(() => Seller)
  @ManyToOne(() => Seller, { nullable: true, eager: true })
  seller: Promise<Seller>;
  @Index()
  @Column({ nullable: true })
  sellerId: number;


  @Field({ nullable: true })
  @Column({ nullable: true, default: '0' })
  total?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: '0' })
  total_tax?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: '0' })
  total_fi?: string;


  @Field(() => TypeOrderOffer)
  @Index()
  @Column("enum", {
    enum: TypeOrderOffer,
    default: TypeOrderOffer.CLIENT,
  })
  type: TypeOrderOffer;


  @Field(() => ModelOffer)
  @Index()
  @Column("enum", {
    enum: ModelOffer,
    default: ModelOffer.Quotation,
  })
  model: ModelOffer;
  
  @Field(() => [OfferLine],{nullable:"items"})
  @OneToMany(() => OfferLine, offerLine => offerLine.offerOrder)
  offerLine: OfferLine[];


  @Field({ nullable: true })
  @Column({ nullable: true})
  uuid?: string;

  
  @Field(() => OrderOfferStatuses)
  @Index()
  @Column("enum", {
    enum: OrderOfferStatuses,
    default: OrderOfferStatuses.PENDING_PRICE,
  })
  status: OrderOfferStatuses;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  created_at: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 
}
