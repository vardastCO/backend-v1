import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrderStates } from "src/order/enums/pre-order-states.enum";

import {
  BaseEntity,
  Column,
  OneToMany,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("pre_order")
export class PreOrder extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  projectId: number;


  @Index()
  @Column()
  userId: number; 

  @Field()
  @Index()
  @Column({ nullable: true })
  request_date: string; 

  @Field()
  @Index()
  @Column({ nullable: true })
  expire_date: string; 

  @Field()
  @Index()
  @Column({ nullable: true })
  shipping_address: string;

  @Field()
  @Index()
  @Column({ nullable: true })
  payment_methods: string;

  @Field()
  @Index()
  @Column({ nullable: true })
  descriptions: string;

  @Field(() => PreOrderStates)
  @Index()
  @Column("enum", {
    enum: PreOrderStates,
    default: PreOrderStates.CREATED,
  })
  status: PreOrderStates;


  @Field()
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 


}
