import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrderStatus } from "src/order/enums/pre-order-states.enum";
import { Line } from "src/order/line/entities/order-line.entity";
import { OfferOrder } from "src/order/orderOffer/entities/order-offer.entity";
import { PreOrderFile } from "src/order/preFile/entites/pre-order-file.entity";
import { ProjectAddress } from "src/users/project/entities/addressProject.entity";
import { Project } from "src/users/project/entities/project.entity";
import { User } from "src/users/user/entities/user.entity";

import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PaymentMethodEnum } from "../enum/sort-types.enum";
import { ExpireTypes } from "../enum/expire-types.enum";
import { OrderOfferStatuses } from "src/order/orderOffer/enums/order-offer-statuses";
import { TypeOrder } from "../enum/type-order.enum";
import { Category } from "src/base/taxonomy/category/entities/category.entity";

@ObjectType()
@Entity("pre_order")
export class PreOrder extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Project, { nullable: true })
  @ManyToOne(() => Project, { eager: true, nullable: true })
  project: Promise<Project>;

  @Field(() => TypeOrder)
  @Column("enum", {
    enum: TypeOrder,
    default: TypeOrder.REAL,
  })
  type: TypeOrder;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { eager: true, nullable: true })
  category: Promise<Category>;
  @Index()
  @Column({ nullable: true })
  categoryId: number;

  @Index()
  @Column({ nullable: true })
  projectId: number;

  @Field(() => ProjectAddress, { nullable: true })
  @ManyToOne(() => ProjectAddress, { eager: true, nullable: true })
  address: Promise<ProjectAddress>;

  @Column({ nullable: true })
  addressId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: true })
  user: Promise<User>;
  @Column({ nullable: true })
  userId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: true })
  pickUpUser: Promise<User>;
  @Column({ nullable: true })
  pickUpUserId: number;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  request_date: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  delivery_fullName: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  delivery_contact: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  expert_name: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  applicant_name: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  need_date: Date;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  bid_end: Date;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  bid_start: Date;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  expire_time: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  shipping_address: string;

  @Field(() => PaymentMethodEnum)
  @Index()
  @Column("enum", {
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.CASH,
  })
  payment_methods: PaymentMethodEnum;

  @Field(() => ExpireTypes)
  @Index()
  @Column("enum", {
    enum: ExpireTypes,
    default: ExpireTypes.ONE_DAY,
  })
  expire_date: ExpireTypes;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  descriptions: string;

  @Field(() => [Line], { nullable: "items" })
  @OneToMany(() => Line, line => line.preOrder)
  lines: Promise<Line[]>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lineDetail?: string;

  @Field(() => [PreOrderFile], { nullable: "items" })
  @OneToMany(() => PreOrderFile, file => file.preOrder)
  files: Promise<PreOrderFile[]>;

  @Field(() => Boolean, { defaultValue: false })
  hasFile: Boolean = false;

  @Field(() => PreOrderStatus)
  @Index()
  @Column("enum", {
    enum: PreOrderStatus,
    default: PreOrderStatus.PENDING_INFO,
  })
  status: PreOrderStatus;

  @Field(() => OrderOfferStatuses)
  @Index()
  @Column("enum", {
    enum: OrderOfferStatuses,
    default: OrderOfferStatuses.PENDING_PRICE,
  })
  last_offer_status: OrderOfferStatuses;

  @Field({ nullable: true })
  @Column({ nullable: true, default: 0 })
  offersNum?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  uuid?: string;

  @Field(() => [OfferOrder], { nullable: true })
  offers?: OfferOrder[];

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  deleted_at: string;
}
