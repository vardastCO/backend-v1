import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OfferHasLine } from "./offerHasLine";


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


  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  request_name: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  total: string;

  

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
