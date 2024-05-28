import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";



@ObjectType()
@Entity("temp_seller")
export class TempSeller extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  company_name: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  seller_name: string;


  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  cellphone: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  address: string;


  
}
