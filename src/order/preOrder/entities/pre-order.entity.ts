import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrderStates } from "src/order/enums/pre-order-states.enum";
import { Line } from "src/order/line/entities/order-line.entity";
import { PreOrderFile } from "src/order/preFile/entites/pre-order-file.entity";
import { ProjectAddress } from "src/users/project/entities/addressProject.entity";
import { Project } from "src/users/project/entities/project.entity";
import { ProjectHasAddress } from "src/users/project/entities/projectHasAddress.entity";
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

@ObjectType()
@Entity("pre_order")
export class PreOrder extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Project, { nullable: true })
  @ManyToOne(() => Project, { eager: true, nullable: true })
  project: Promise<Project>;

  @Index()
  @Column({ nullable: true })
  projectId: number;

  @Field(() => ProjectAddress, { nullable: true })
  @ManyToOne(() => ProjectAddress, { nullable: true })
  address: Promise<ProjectAddress>;

  @Column({ nullable: true })
  addressId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: true })
  user: Promise<User>;
  @Column({ nullable: true })
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
  @Column({ nullable: true, default: '0' })
  offersNum?: string;

  @Field({ nullable: true })
  @Column({ nullable: true})
  uuid?: string;


  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  deleted_at: string; 


}
