import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  Index,
  ManyToMany,
  JoinColumn,
  JoinTable,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PriceTypesEnum } from "../enums/price-types.enum";
import { MessagePriceTypesEnum } from "../enums/message-price-types.enum";
import { Price } from "./price.entity";

@ObjectType()
@Entity("product_prices_message")
export class MessagePrice extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: "product_prices_message_id" })
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  message?: string;

  @Field(() => PriceTypesEnum)
  @Column("enum", { enum: MessagePriceTypesEnum , default : MessagePriceTypesEnum.ERROR})
  type: PriceTypesEnum;


  @Field(() => Price)
  @ManyToOne(() => Price, price => price.discount)
  price: Promise<Price>;
  @Index()
  @Column()
  priceId: number;

}
