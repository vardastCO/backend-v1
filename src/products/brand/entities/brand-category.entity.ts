import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Brand } from "./brand.entity";


@ObjectType()
@Unique(["categoryId", "brandId"])
@Entity("category_brands")
export class CategoryBrand extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Category)
  @ManyToOne(() => Category)
  category: Promise<Category>;
  @Index()
  @Column()
  categoryId: number ;

  @Field(() => Brand)
  @ManyToOne(() => Brand)
  brand: Promise<Brand>;
  @Index()
  @Column()
  brandId: number ;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

}
