import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { City } from "../../city/entities/city.entity";

@ObjectType()
@Entity("base_location_areas")
@Unique(["name", "cityId"])
@Unique(["nameEn", "cityId"])
export class Area extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nameEn?: string;

  @Field(type => Int, { nullable: true })
  @Column("int2", { nullable: true })
  municipalityDistrict?: number;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field(() => Int)
  @Column()
  sort: number;

  @Field(() => Boolean)
  @Column()
  isActive: boolean;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  longitude?: number;

  @Field(() => City)
  @ManyToOne(() => City)
  city: City;

  @Column()
  cityId: number;
}
