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
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { Address } from "src/users/address/entities/address.entity";
import { Member } from "src/users/member/entities/members.entity";


@ObjectType()
@Entity("legals")
export class Legal extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique:true})
  name_company: string;

  @Field()
  @Column({ unique: true })
  national_id: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  create_at?: Date;

  
  @Field(() => [ContactInfo])
  @OneToMany(() => ContactInfo, contactInfo => null, { nullable: true })
  contacts: ContactInfo[];

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field(() => [Member])
  @OneToMany(
    () => Member,
    member => member.relatedId,
  )
  members: Promise<Member[]>;
  
}
