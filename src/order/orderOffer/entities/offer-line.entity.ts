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
import { User } from "src/users/user/entities/user.entity";



@ObjectType()
@Entity("offer_has_line")
export class OfferLine extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => OfferOrder)
  @ManyToOne(() => OfferOrder, { eager: true })
  offerOrder: Promise<OfferOrder>;
  @Index()
  @Column()
  offerOrderId: number;


  @Field(() => Line)
  @ManyToOne(() => Line,{ eager: true })
  line: Promise<Line>;
  @Index()
  @Column()
  lineId: number;

  
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: true })
  user: Promise<User>;
  @Column({ nullable: true })
  userId: number;

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
