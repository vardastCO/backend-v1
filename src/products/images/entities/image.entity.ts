import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { ProductEntity } from "src/products/product/entities/product-service.entity";
import { Product } from "src/products/product/entities/product.entity";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("product_images")
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Product)
  @ManyToOne(() => Product, product => product.images)
  product: Promise<Product>;
  @Index()
  @Column()
  productId: number;

  // @ManyToOne(() => ProductEntity, product => product.images, { nullable: true })
  // @JoinColumn({ name: 'productEntityId' })
  // @Index()
  // productEntity: Promise<ProductEntity>;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column("int4", { default: 0 })
  sort: number;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isPublic: boolean;
}
