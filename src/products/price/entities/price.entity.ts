import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AttributeValue } from "src/products/attribute-value/entities/attribute-value.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PriceTypesEnum } from "../enums/price-types.enum";
import { ProductEntity } from "src/products/product/entities/product-service.entity";

@ObjectType()
@Entity("product_prices")
export class Price extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: "product_prices_id" })
  id: number;

  @Field(() => Product)
  @ManyToOne(() => Product, product => product.prices, { nullable: false })
  product: Promise<Product>;
  @Index()
  @Column()
  productId: number;

  // @ManyToOne(() => ProductEntity, product => product.prices, { nullable: true })
  // @JoinColumn({ name: 'productEntityId' })
  // @Index()
  // productEntity: Promise<ProductEntity>;

  @Field(() => PriceTypesEnum)
  @Column("enum", { enum: PriceTypesEnum , default : PriceTypesEnum.CONSUMER})
  type: PriceTypesEnum;

  @Field(() => Int)
  @Column()
  amount: number;

  @Field(() => Seller)
  @ManyToOne(() => Seller, seller => seller.prices)
  seller: Promise<Seller>;
  @Index()
  @Column()
  sellerId: number;

  @Field(() => AttributeValue, { nullable: true })
  @ManyToOne(() => AttributeValue, attributeValue => attributeValue.prices)
  attributeValue: Promise<AttributeValue>;
  @Column({ nullable: true })
  attributeValueId: number;

  @Field()
  @Column()
  isPublic: boolean;

  @Field(() => User)
  @ManyToOne(() => User, user => null, { nullable: false })
  createdBy: Promise<User>;
  @Column()
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
