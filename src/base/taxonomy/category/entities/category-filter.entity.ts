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
export class Banner extends BaseEntity {

  @Field(() => Category)
  @OneToOne(() => Category, category => null, { eager: true })
  @JoinColumn()
  category: Promise<Category>;
  @Index()
  @Column()
  categoryId: number;

  @Field(() => AttributesProductService)
  @OneToOne(() => AttributesProductService, attribuite => null, { eager: true })
  @JoinColumn()
  attribuite: Promise<AttributesProductService>;
  @Index()
  @Column()
  attribuiteId: number;


}
