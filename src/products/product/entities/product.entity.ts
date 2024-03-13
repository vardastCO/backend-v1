import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { InfraEntity } from "src/base/utilities/entities/infra.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { AttributeValue } from "src/products/attribute-value/entities/attribute-value.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Image } from "src/products/images/entities/image.entity";
import { Offer } from "src/products/offer/entities/offer.entity";
import { Price } from "src/products/price/entities/price.entity";
import { Uom } from "src/products/uom/entities/uom.entity";
import { User } from "src/users/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { ProductTypesEnum } from "../enums/product-types.enum";

@Index("idx_product_name", ["name"])
@ObjectType()
@Entity("products")
export class Product extends InfraEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  slug: string;

  @Field(() => ProductTypesEnum)
  @Column()
  type: ProductTypesEnum;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  sku: string;

  @Field({ nullable: true })
  @Column({ nullable: true})
  techNum: string;

  @Field(() => Brand)
  @ManyToOne(() => Brand, brand => brand.products)
  brand: Promise<Brand>;
  @Index()
  @Column()
  brandId: number;

  @Field(() => Category)
  @ManyToOne(() => Category, category => null)
  category: Promise<Category>;
  @Index()
  @Column()
  categoryId: number;

  @Field(() => Uom)
  @ManyToOne(() => Uom, uom => uom.products)
  uom: Promise<Uom>;
  @Index()
  @Column()
  uomId: number;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.PENDING,
  })
  status: ThreeStateSupervisionStatuses;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isActive: boolean = true;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaDescription: string;

  @Field(() => [AttributeValue], { nullable: "items" })
  @OneToMany(() => AttributeValue, attributeValue => attributeValue.product)
  attributeValues: Promise<AttributeValue[]>;

  @Field(() => User)
  @ManyToOne(() => User, user => null)
  createdBy: Promise<User>;
  @Index()
  @Column()
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ nullable: true })
  deletedAt: Date; 

  @Field(() => [Price], { nullable: "items" })
  @OneToMany(() => Price, price => price.product)
  prices: Promise<Price[]>;

  @Field(() => [Image], { nullable: "items" })
  @OneToMany(() => Image, image => image.product)
  images: Promise<Image[]>;

  @Field(() => [Offer], { nullable: "items" })
  @OneToMany(() => Offer, offer => offer.product)
  offers: Promise<Offer[]>;

  @Field(() => [Offer], { nullable: "items" })
  publicOffers: Offer[];

  @Field(() => Price, { nullable: true })
  lowestPrice: Price;
  @Field(() => Price, { nullable: true })
  highestPrice: Price;

  @Field(() => [Product], { nullable: "items" })
  sameCategory: Promise<Product[]>;

  @Field(() => Int)
  @Column("int4", { default: 0 })
  sort = 0;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  tag?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rating?: number = 4;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rank?: number = 1;

  protected searchableFields = [
    "name",
    "description",
    "title",
    "metaDescription",
  ];
}
