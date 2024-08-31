import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  Entity,
  ManyToOne,
  Index,
  BaseEntity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ParentProductEntity } from "./parent-product.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { AttributeValuesProductService } from "src/products/attribute-value/entities/attribute-value-service.entity";

@ObjectType()
@Entity("products_detail")
export class ProductEntity extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn({ type: "int" })
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  description: string;

  @Field()
  @Column({ unique: true })
  sku: string;

  @Field(() => ParentProductEntity)
  @ManyToOne(() => ParentProductEntity)
  parent: Promise<ParentProductEntity>;
  @Index()
  @Column()
  parentId: number;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  @Field(() => [AttributeValuesProductService], { nullable: "items" })
  @OneToMany(
    () => AttributeValuesProductService,
    attributeValue => attributeValue.product,
  )
  attributeValues: Promise<AttributeValuesProductService[]>;

  // @Field(() => [Price], { nullable: "items" })
  // @OneToMany(() => Price, price => price.product)
  // prices: Promise<Price[]>;

  // @Field(() => [Image], { nullable: "items" })
  // @OneToMany(() => Image, image => image.product)
  // images: Promise<Image[]>;

  // @Field(() => [Offer], { nullable: "items" })
  // @OneToMany(() => Offer, offer => offer.product)
  // offers: Promise<Offer[]>;

  // @Field(() => [Offer], { nullable: "items" })
  // publicOffers: Offer[];

  // @Field(() => Price, { nullable: true })
  // lowestPrice: Price;
  // @Field(() => Price, { nullable: true })
  // highestPrice: Price;

  // @Field(() => [ProductEntity], { nullable: "items" })
  // sameCategory: Promise<ProductEntity[]>;
}
