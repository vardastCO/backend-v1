import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Product } from "src/products/product/entities/product.entity";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributesProductService } from "src/products/attribute/entities/attribute_product.entity";
import { ValuesService } from "./value-service.entity";

@ObjectType()
@Entity("attributes_value_product_service")
export class AttributeValuesProductService extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: "attributes_value_product_service_id",
  })
  id: number;
  @Field(() => Product)
  @ManyToOne(() => Product, {
    nullable: false,
  })
  product: Promise<Product>;
  @Index()
  @Column()
  productId: number;

  @Field(() => AttributesProductService)
  @ManyToOne(() => AttributesProductService, { eager: true })
  attribute: Promise<AttributesProductService>;

  @Index()
  @Column({ name: "attributeId" })
  attributeId: number;

  @Field(() => ValuesService)
  @ManyToOne(() => ValuesService, { eager: true })
  value: Promise<ValuesService>;

  @Index()
  @Column({ name: "valueId" })
  valueId: number;
}
