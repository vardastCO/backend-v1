import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { Price } from "src/products/price/entities/price.entity";
import { ProductEntity } from "src/products/product/entities/product-service.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity("product_offers")
@Index(["productId", "sellerId"], { unique: true }) 
export class Offer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Seller)
  @ManyToOne(() => Seller, seller => seller.offers)
  seller: Promise<Seller>;
  @Index()
  @Column()
  sellerId: number;

  @Field(() => Product)
  @ManyToOne(() => Product, product => product.offers)
  product: Promise<Product>;
  @Index()
  @Column()
  productId: number;

  // @ManyToOne(() => ProductEntity, product => product.offers, { nullable: true })
  // @JoinColumn({ name: 'productEntityId' })
  // @Index()
  // productEntity: Promise<ProductEntity>;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;


  @Field({ nullable: true })
  @Column({ default: true })
  isPublic: boolean = true;

  @Field({ nullable: true })
  @Column({ default: true })
  isAvailable: boolean = true;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inventory?: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Price, { nullable: true })
  @ManyToOne(() => Price)
  @Index() 
  lastPublicConsumerPrice: Promise<Price>;
}
