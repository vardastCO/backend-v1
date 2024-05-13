import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Project } from "./project.entity";

@ObjectType()
@Entity("user_project")
export class UserProject extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Project)
  @ManyToOne(() => Project)
  project: Promise<Project>;
  @Column()
  projectId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  user: Promise<User>;
  @Column()
  userId: number;


}
