// src/options/option.entity.ts
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { AttributeValuesProductService } from "src/products/attribute-value/entities/attribute-value-service.entity";
import { ValuesService } from "src/products/attribute-value/entities/value-service.entity";
import { AttributesProductService } from "src/products/attribute/entities/attribute_product.entity";
import { ParentProductEntity } from "src/products/product/entities/parent-product.entity";
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
@Entity()
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ParentProductEntity)
  @ManyToOne(() => ParentProductEntity)
  parentProduct: Promise<ParentProductEntity>;
  @Index()
  @JoinColumn({ name: "parentProductId" })
  @Column()
  parentProductId: number;

  @Field(() => AttributesProductService)
  @ManyToOne(() => AttributesProductService)
  attribuite: Promise<AttributesProductService>;
  @Index()
  @Column()
  attribuiteId: number;

  @Field(() => ValuesService)
  @ManyToOne(() => ValuesService)
  value: Promise<ValuesService>;
  @Index()
  @Column()
  valueId: number;
}
