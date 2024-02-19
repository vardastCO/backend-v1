import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { Product } from "src/products/product/entities/product.entity";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("product_uom")
export class Uom extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column()
  symbol: string;

  @Field()
  @Column()
  isActive: boolean;

  @Field(type => [Product])
  @OneToMany(type => Product, product => product.uom)
  products: Promise<Product[]>;

  @Field(() => Attribute)
  @OneToMany(() => Attribute, attribute => attribute.uom)
  attributes: Promise<Attribute[]>;
}
