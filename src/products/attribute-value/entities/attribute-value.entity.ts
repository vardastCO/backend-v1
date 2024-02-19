import { Field, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { Product } from "src/products/product/entities/product.entity";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Attribute } from "../../attribute/entities/attribute.entity";
import { Price } from "src/products/price/entities/price.entity";

@ObjectType()
@Entity("product_attribute_values")
export class AttributeValue extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: "product_attribute_values_id",
  })
  id: number;

  @Field(() => Product)
  @ManyToOne(() => Product, product => product.attributeValues, {
    nullable: false,
  })
  product: Promise<Product>;
  @Column()
  productId: number;

  @Field(() => Attribute)
  @ManyToOne(() => Attribute, attribute => attribute.attributeValues, {
    eager: true,
    nullable: false,
  })
  attribute: Promise<Attribute>;
  @Column()
  attributeId: number;

  @Field(() => GraphQLJSON)
  @Column("jsonb")
  value: any;

  @Field()
  @Column()
  isVariant: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sku?: string;

  @Field(() => [Price], { nullable: "items" })
  @OneToMany(() => Price, price => price.attributeValue)
  prices: Promise<Price[]>;
}
