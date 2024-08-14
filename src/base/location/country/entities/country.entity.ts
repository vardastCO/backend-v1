import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Province } from "../../province/entities/province.entity";

@ObjectType()
@Entity("base_location_countries")
export class Country extends BaseEntity {
  public static IR = 244;

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  nameEn: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column({ unique: true })
  alphaTwo: string;

  @Field()
  @Column({ unique: true })
  iso: string;

  @Field()
  @Column()
  phonePrefix: string;

  // TODO: change default value to SQL: currval('base_location_countries_id_seq')
  @Field(() => Int)
  @Column({ default: 0 })
  sort: number = 0;

  @Field(() => Boolean)
  @Column()
  isActive: boolean;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  longitude?: number;

  @Field(() => [Province], { nullable: "items" })
  @OneToMany(() => Province, province => province.country)
  provinces: Province[];

  @Field()
  flagEmoji: string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  generateFlagEmoji(): void {
    this.flagEmoji = this.getFlagEmoji();
  }

  getFlagEmoji(): string {
    const codePoints = this.alphaTwo
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}
