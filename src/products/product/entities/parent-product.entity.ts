import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Option } from "src/products/options/entities/option.entity";
import { Uom } from "src/products/uom/entities/uom.entity";
import {
  Column,
  Entity,
  ManyToOne,
  Index,
  BaseEntity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("parent_product")
export class ParentProductEntity extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Brand)
  @ManyToOne(() => Brand)
  brand: Promise<Brand>;
  @Index()
  @Column()
  brandId: number;

  @Field(() => Category)
  @ManyToOne(() => Category)
  category: Promise<Category>;
  @Index()
  @Column()
  categoryId: number;

  @Field(() => Uom)
  @ManyToOne(() => Uom)
  uom: Promise<Uom>;
  @Index()
  @Column()
  uomId: number;

  @Field(() => [Option], { nullable: "items" })
  @OneToMany(() => Option, option => option.parentProduct)
  option: Promise<Option[]>;
}
