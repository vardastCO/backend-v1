import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Address } from "src/users/address/entities/address.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { Member } from "src/users/member/entities/members.entity";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LegalStateEnum } from "../enum/legalState.enum";
import { LegalStatusEnum } from "../enum/legalStatus.enum";
import { Project } from "src/users/project/entities/project.entity";

@ObjectType()
@Entity("legals")
export class Legal extends BaseEntity {
  public static SHABA_COUNTRY_CODE = "IR";

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Index()
  @Column({ unique: true })
  name_company: string;

  @Field()
  @Index()
  @Column({ unique: true })
  national_id: string;

  @Field({ nullable: true })
  @Index()
  @Column({ default: "0", nullable: true })
  wallet?: string;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ type: "timestamp", nullable: true })
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

  @Field(() => LegalStateEnum)
  @Column("enum", {
    enum: LegalStateEnum,
    default: LegalStateEnum.PENDING_OWNER,
  })
  state: LegalStateEnum;

  @Field(() => LegalStatusEnum)
  @Column("enum", {
    enum: LegalStatusEnum,
    default: LegalStatusEnum.DEACTIVE,
  })
  status: LegalStatusEnum;

  @Field({ nullable: true })
  @Column({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  accountNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  shabaNumber?: string;

  @Field(() => [ContactInfo])
  @OneToMany(() => ContactInfo, contactInfo => null, { nullable: true })
  contacts: ContactInfo[];

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field(() => [Member])
  @OneToMany(() => Member, member => null, { nullable: true })
  members: Member[];

  @Field(() => [Project])
  @OneToMany(() => Project, project => project.legal, { nullable: true })
  projects: Project[];


}
