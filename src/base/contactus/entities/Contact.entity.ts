import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("contact_us")
export class ContactUs extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field()
  @Column()
  @Index()
  fullname: string;

  @Field()
  @Column()
  @Index()
  title: string;

  @Field()
  @Column()
  @Index()
  cellphone: string;

  @Field()
  @Column()
  @Index()
  text: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId: number;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  file: Promise<File>;
}
