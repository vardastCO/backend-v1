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

@ObjectType()
@Entity("projects")
export class Project extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => [ProjectHasAddress], { nullable: "items" })
  @OneToMany(() => ProjectHasAddress, projectHasAddress => projectHasAddress.project)
  address: Promise<ProjectHasAddress[]>;

  @Field(() => [UserProject], { nullable: "items" })
  @OneToMany(() => UserProject, userProject => userProject.project)
  user: Promise<UserProject[]>;
}
