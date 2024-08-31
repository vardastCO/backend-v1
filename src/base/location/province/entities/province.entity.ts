import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { City } from "../../city/entities/city.entity";
import { Country } from "../../country/entities/country.entity";

@ObjectType()
@Entity("base_location_provinces")
@Unique(["name", "countryId"])
@Unique(["nameEn", "countryId"])
export class Province extends BaseEntity {
  public static TEHRAN = 12;

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  nameEn: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  path?: string;

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

  @Field(() => Country)
  @ManyToOne(() => Country, country => country.provinces)
  country: Country;

  @Column()
  countryId: number;

  @Field(() => [City], { nullable: "items" })
  @OneToMany(() => City, city => city.province)
  cities: City[];
}
