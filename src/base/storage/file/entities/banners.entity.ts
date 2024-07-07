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



@ObjectType()
@Entity("banners")
export class Banner extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  small: Promise<File>;
  @Index()
  @Column()
  smallId: number;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  medium: Promise<File>;
  @Index()
  @Column()
  mediumId: number;


  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  large: Promise<File>;
  @Index()
  @Column()
  largeId: number;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  xlarge: Promise<File>;
  @Index()
  @Column()
  xlargeId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url: string;

}
