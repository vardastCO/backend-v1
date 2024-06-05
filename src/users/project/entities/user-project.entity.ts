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
import { TypeUserProject } from "../enums/type-user-project.enum";

@ObjectType()
@Entity("user_project")
export class UserProject extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

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

  @Field(() => TypeUserProject)
  @Column("enum", {
    enum: TypeUserProject,
    default: TypeUserProject.EMPLOYER,
  })
  type: TypeUserProject;


}
