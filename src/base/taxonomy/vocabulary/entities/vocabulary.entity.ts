import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "../../category/entities/category.entity";

@ObjectType()
@Entity("base_taxonomy_vocabularies")
export class Vocabulary extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  titleEn?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  // TODO: change default value to SQL: currval('base_taxonomy_vocabularies_id_seq')
  @Field(() => Int)
  @Column({ default: 0 })
  sort: number = 0;

  @Field({ nullable: true })
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Category], { nullable: "items" })
  @OneToMany(() => Category, category => category.vocabulary)
  categories?: Promise<Category[]>;
}
