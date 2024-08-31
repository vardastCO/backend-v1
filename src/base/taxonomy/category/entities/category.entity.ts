import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Vocabulary } from "../../vocabulary/entities/vocabulary.entity";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { ImageCategory } from "./category-image.entity";

@ObjectType()
@Index("idx_category_title", ["title"])
@Entity("base_taxonomy_categories")
export class Category extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Vocabulary)
  @ManyToOne(() => Vocabulary, vocabulary => vocabulary.categories)
  vocabulary: Promise<Vocabulary>;

  @Column()
  vocabularyId: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @Column({ type: "int", nullable: true, default: 1 })
  views?: number;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, category => category?.children, { nullable: true })
  parentCategory?: Promise<Category>;

  @Column({ nullable: true })
  parentCategoryId?: number;

  @Field(() => [Category], { nullable: "items" })
  @OneToMany(() => Category, category => category.parentCategory)
  children: Category[];

  @Field()
  @Column({ unique: true })
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  titleEn?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  // TODO: change default value to SQL: currval('base_taxonomy_categories_id_seq')
  @Field(() => Int)
  @Column("int4", { default: 0 })
  sort = 0;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @CreateDateColumn({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;

  @Field(() => [Attribute], { nullable: "items" })
  @ManyToMany(() => Attribute, attribute => attribute.categories)
  attributes: Promise<Attribute[]>;

  @Field(() => [ImageCategory], { nullable: true })
  @OneToMany(() => ImageCategory, imageCategory => imageCategory?.category)
  imageCategory?: Promise<ImageCategory[]>;
}
