import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "./file.entity";
import { ThreeBannerStatuses } from "../enums/three-banner-statuses.enum";



@ObjectType()
@Entity("banners")
export class Banner extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => File)
  @OneToOne(() => File)
  @JoinColumn()
  small: Promise<File>;
  @Index()
  @Column()
  smallId: number;

  @Field(() => File)
  @OneToOne(() => File)
  @JoinColumn()
  medium: Promise<File>;
  @Index()
  @Column()
  mediumId: number;


  @Field(() => File)
  @OneToOne(() => File)
  @JoinColumn()
  large: Promise<File>;
  @Index()
  @Column()
  largeId: number;

  @Field(() => File)
  @OneToOne(() => File)
  @JoinColumn()
  xlarge: Promise<File>;
  @Index()
  @Column()
  xlargeId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url: string;

  @Field(() => ThreeBannerStatuses)
  @Index()
  @Column("enum", {
    enum: ThreeBannerStatuses,
    default: ThreeBannerStatuses.CONFIRMED,
  })
  status: ThreeBannerStatuses;

  @Field(() => Int, {
    description: "First Banner with sort 0 is considered primary.",
  })
  @Column("smallint", { default: 0 })
  sort?: number;

}
