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
  Unique,
} from "typeorm";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { Address } from "src/users/address/entities/address.entity";
import { Member } from "src/users/member/entities/members.entity";
import { User } from "src/users/user/entities/user.entity";


@ObjectType()
@Entity("legals")
export class Legal extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable:true,unique:true})
  name_company?: string;

  @Field({ nullable: true })
  @Column({ nullable:true,unique: true })
  national_id?: string;

  @Field({ nullable: true })
  @Column({  default: '0', nullable: true  })
  wallet?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  create_at?: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: false })
  createdBy: Promise<User>;
  @Column({ nullable: true })
  createdById: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: false })
  owner: Promise<User>;
  @Column({ nullable: true })
  ownerId: number;

  
  @Field(() => [ContactInfo])
  @OneToMany(() => ContactInfo, contactInfo => null, { nullable: true })
  contacts: ContactInfo[];

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field(() => [Member])
  @OneToMany(() => Member, member => null, { nullable: true })
  members:Member[];
  
}
