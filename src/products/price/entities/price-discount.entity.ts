import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  Index,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Price } from "./price.entity";
import { DiscountTypesEnum } from "../enums/price-discount-types.enum";

@ObjectType()
@Entity("product_prices_discount")
export class DiscountPrice extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: "product_prices_discount_id" })
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  value?: string;


  @Field({ nullable: true })
  @Column({ nullable: true })
  calculated_price?: string;

  @Field(() => DiscountTypesEnum)
  @Column("enum", { enum: DiscountTypesEnum , default : DiscountTypesEnum.PERCENT})
  type: DiscountTypesEnum;

  // @Field(() => [Price], { nullable: "items" })
  // @OneToMany(() => Price)
  // prices: Promise<Price[]>;

}
