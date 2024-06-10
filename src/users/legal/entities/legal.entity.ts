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
import { ThreeStateSupervisionStatuses } from "src/order/enums/three-state-supervision-statuses.enum";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { Address } from "src/users/address/entities/address.entity";


@ObjectType()
@Entity("legals")
export class Legals extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name_company?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  national_id?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  create_at?: Date;

  
  @Field(() => [ContactInfo])
  @OneToMany(() => ContactInfo, contactInfo => null, { nullable: true })
  contacts: ContactInfo[];

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field(() => [UserProject], { nullable: "items" })
  @OneToMany(() => UserProject, userProject => userProject.project)
  user: Promise<UserProject[]>;

  
  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;
}
