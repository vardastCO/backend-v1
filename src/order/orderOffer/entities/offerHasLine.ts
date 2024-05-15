import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Line } from "src/order/line/entities/order-line.entity";
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OfferOrder } from "./order-offer.entity";
import { TypeOrderOffer } from "src/order/enums/type-order-offer.enum";



@ObjectType()
@Entity("offer_has_line")
export class OfferHasLine extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;


  @Field(() => OfferOrder)
  @ManyToOne(() => OfferOrder)
  offerOrder: Promise<OfferOrder>;
  @Column()
  offerOrderId: number;

  @Field(() => Line)
  @ManyToOne(() => Line)
  line: Promise<Line>;
  @Column()
  lineId: number;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  fi_price: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  tax_price: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  total_price: string;

  @Field(() => TypeOrderOffer)
  @Index()
  @Column("enum", {
    enum: TypeOrderOffer,
    default: TypeOrderOffer.CLIENT,
  })
  type: TypeOrderOffer;
  
}
