import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Country } from "src/base/location/country/entities/country.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { ContactInfoRelatedTypes } from "../enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "../enums/contact-info-types.enum";

@ObjectType()
@Entity("users_contact_infos")
@Unique("users_contact_infos_related_title_unique", [
  "relatedType",
  "relatedId",
  "title",
])
export class ContactInfo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ContactInfoRelatedTypes)
  @Column("enum", { enum: ContactInfoRelatedTypes })
  relatedType: ContactInfoRelatedTypes;

  @Field(() => Int)
  @Column()
  relatedId: number;

  @Field()
  @Column()
  title: string;


  @Field({ nullable: true })
  @Column({ nullable: true })
  code?: string;

  @Field()
  @Column()
  number: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ext ?: string;

  @Field(() => ContactInfoTypes)
  @Column("enum", { enum: ContactInfoTypes })
  type: ContactInfoTypes;

  @Field(() => Int, {
    description: "First Contact with sort 0 is considered primary.",
  })
  @Column("smallint", { default: 0 })
  sort?: number;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isPublic: boolean;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  admin: Promise<User>;
  @Column({ nullable: true })
  adminId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  combinedNumber?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  rejectionReason: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
