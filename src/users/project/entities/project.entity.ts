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
  @Column({ nullable: true })
  description?: string;

  @Field(() => TypeProject)
  @Column("enum", {
    enum: TypeProject,
    default: TypeProject.LEGAL,
  })
  type: TypeProject;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createTime?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Field(() => [ProjectHasAddress], { nullable: "items" })
  @OneToMany(() => ProjectHasAddress, projectHasAddress => projectHasAddress.project)
  address: Promise<ProjectHasAddress[]>;

  @Field(() => [UserProject], { nullable: "items" })
  @OneToMany(() => UserProject, userProject => userProject.project)
  user: Promise<UserProject[]>;

  
  // @Field(() => ThreeStateSupervisionStatuses)
  // @Column("enum", {
  //   enum: ThreeStateSupervisionStatuses,
  //   default: ThreeStateSupervisionStatuses.CONFIRMED,
  // })
  // status: ThreeStateSupervisionStatuses;
}
