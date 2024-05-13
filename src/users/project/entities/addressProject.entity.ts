import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { City } from "src/base/location/city/entities/city.entity";
import { Country } from "src/base/location/country/entities/country.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
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


@ObjectType()
@Entity("users_addresses_project")
export class ProjectAddress extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  delivery_contact?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  delivery_name?: string;

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


  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  

  @Field()
  @CreateDateColumn()
  createdAt: Date;

}
