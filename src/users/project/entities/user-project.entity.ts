import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import { UserTypeProject } from "../enums/type-user-project.enum";
import { Project } from "./project.entity";

@ObjectType()
@Unique(["projectId", "userId"])
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

  @Field(() => UserTypeProject)
  @Column("enum", {
    enum: UserTypeProject,
    default: UserTypeProject.EMPLOYER,
  })
  type: UserTypeProject;

  @Field({ nullable: true })
  @Column({  default: '0', nullable: true  })
  wallet?: string;


}
