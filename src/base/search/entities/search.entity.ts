import { Field, Int, ObjectType } from "@nestjs/graphql";

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";


@ObjectType()
@Entity("search_query")
export class SearchQuery extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  query: string;
 
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @Column({ type: 'int', nullable: true, default: 1 })
  views?: number;
  

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  
}
