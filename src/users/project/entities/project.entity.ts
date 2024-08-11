import { Field, Int, ObjectType } from "@nestjs/graphql";
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

import { UserProject } from "./user-project.entity";
import { ProjectHasAddress } from "./projectHasAddress.entity";
import { TypeProject } from "../enums/type-project.enum";
import { ThreeStateSupervisionStatuses } from "src/order/enums/three-state-supervision-statuses.enum";
import { MultiStatuses } from "../enums/multi-statuses.enum";
import { Legal } from "src/users/legal/entities/legal.entity";

@ObjectType()
@Entity("projects")
export class Project extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true})
  uuid?: string;

  @Field({ nullable: true })
  @Column({ nullable: true,default:'0'})
  closedOrdersCount?: string;

  @Field({ nullable: true })
  @Column({ nullable: true,default:'0'})
  openOrdersCount?: string;

  @Field({ nullable: true })
  @Column({ nullable: true,default:'0'})
  failedOrdersCount?: string;

  @Field({ nullable: true })
  @Column({ nullable: true,default:'0'})
  totalOrdersCount?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  // @Field(() => TypeProject)
  // @Column("enum", {
  //   enum: TypeProject,
  //   default: TypeProject.LEGAL,
  // })
  // type: TypeProject;

  @Field({ nullable: true })
  @Column({  default: '0', nullable: true  })
  wallet?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime?: Date;


  @Field(() => [ProjectHasAddress], { nullable: "items" })
  @OneToMany(() => ProjectHasAddress, projectHasAddress => projectHasAddress.project)
  address: Promise<ProjectHasAddress[]>;

  @Field(() => [UserProject], { nullable: "items" })
  @OneToMany(() => UserProject, userProject => userProject.project)
  user: Promise<UserProject[]>;

  @Field(() => Legal, { nullable: true })
  @ManyToOne(() => Legal, legal => legal.projects, { nullable: true })
  legal?: Legal;

  @Column({ nullable: true })
  legalId?: number;

  
  @Field(() => MultiStatuses)
  @Column("enum", {
    enum: MultiStatuses,
    default: MultiStatuses.CONFIRMED,
  })
  status: MultiStatuses;
}
