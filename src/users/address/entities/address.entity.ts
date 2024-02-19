import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { City } from "src/base/location/city/entities/city.entity";
import { Country } from "src/base/location/country/entities/country.entity";
import { Province } from "src/base/location/province/entities/province.entity";
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
import { AddressRelatedTypes } from "../enums/address-related-types.enum";

@ObjectType()
@Entity("users_addresses")
@Unique("users_addresses_related_title_unique", [
  "relatedType",
  "relatedId",
  "title",
])
export class Address extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => AddressRelatedTypes)
  @Column()
  relatedType: AddressRelatedTypes;

  @Field(() => Int)
  @Column()
  relatedId: number;

  @Field()
  @Column()
  title: string;

  @Field(() => Country)
  @ManyToOne(() => Country)
  country: Promise<Country>;
  @Column()
  countryId: number;

  @Field(() => Province)
  @ManyToOne(() => Province)
  province: Promise<Province>;
  @Column()
  provinceId: number;

  @Field(() => City)
  @ManyToOne(() => City)
  city: Promise<City>;
  @Column()
  cityId: number;

  @Field()
  @Column()
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  postalCode?: string;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true , default : 35.78077793394653})
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true , default : 51.448873906960394 })
  longitude?: number;

  @Field(() => Int, {
    description: "First Address with sort 0 is considered primary.",
  })
  @Column("smallint", { default: 0 })
  sort?: number;

  @Field()
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
  @Column("text", { nullable: true })
  rejectionReason: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
