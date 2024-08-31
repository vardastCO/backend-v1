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
import { Category } from "./category.entity";
import { AttributesProductService } from "src/products/attribute/entities/attribute_product.entity";

@ObjectType()
@Entity("category_filter")
export class Filter_Category extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { nullable: true })
  @Index()
  @Column({ nullable: true })
  categoryId: number;

  @Field(() => Int, { nullable: true })
  @Index()
  @Column({ nullable: true })
  attribuiteId: number;
}
