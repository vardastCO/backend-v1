import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrderStates } from "src/order/enums/pre-order-states.enum";
import { Line } from "src/order/line/entities/order-line.entity";
import { PreOrderFile } from "src/order/preFile/entites/pre-order-file.entity";

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

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  projectId: number;


  @Index()
  @Column()
  userId: number; 

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  request_date: string; 

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  expire_date: string; 

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  shipping_address: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  payment_methods: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  descriptions: string;

  @Field(() => [Line], { nullable: "items" })
  @OneToMany(() => Line, line => line.preOrder) 
  lines: Promise<Line[]>;

  @Field(() => [PreOrderFile], { nullable: "items" })
  @OneToMany(() => PreOrderFile, file => file.preOrder) 
  files: Promise<PreOrderFile[]>;

  @Field(() => PreOrderStates)
  @Index()
  @Column("enum", {
    enum: PreOrderStates,
    default: PreOrderStates.CREATED,
  })
  status: PreOrderStates;


  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 


}
