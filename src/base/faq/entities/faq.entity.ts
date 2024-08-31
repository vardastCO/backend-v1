import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity("fq")
export class FAQ extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field()
  @Column()
  question: string;

  @Field()
  @Column()
  answer: string;
}
