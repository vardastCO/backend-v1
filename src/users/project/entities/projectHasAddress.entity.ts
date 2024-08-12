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
import { Project } from "./project.entity";
import { Address } from "src/users/address/entities/address.entity";


@ObjectType()
@Entity("project_has_address")
export class ProjectHasAddress extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;


  @Field(() => Project)
  @ManyToOne(() => Project)
  project: Promise<Project>;
  @Column()
  projectId: number;

  @Field(() => Address)
  @ManyToOne(() => Address)
  address: Promise<Address>;
  @Column()
  addressId: number;
  
  
}
