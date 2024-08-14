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
import { Area } from "../../area/entities/area.entity";
import { Province } from "../../province/entities/province.entity";
import { CityTypesEnum } from "../enums/city-types.enum";

@ObjectType()
@Entity("base_location_cities")
@Unique(["name", "provinceId"])
@Unique(["nameEn", "provinceId"])
export class City extends BaseEntity {
  public static TEHRAN = 1303;
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nameEn?: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column()
  type: CityTypesEnum;

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

  @Field({ nullable: true })
  @ManyToOne(() => City, city => city.childCities, { nullable: true })
  parentCity?: City;

  @Column({ nullable: true })
  parentCityId: number;

  @OneToMany(type => City, city => city.parentCity, { nullable: true })
  childCities: City[];

  @Field(() => Province)
  @ManyToOne(() => Province)
  province: Province;

  @Column()
  provinceId: number;

  @Field(() => [Area], { nullable: "items" })
  @OneToMany(() => Area, area => area.city)
  areas: Area[];
}
