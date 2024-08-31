import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { AttributeValue } from "src/products/attribute-value/entities/attribute-value.entity";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Uom } from "../../uom/entities/uom.entity";
import { AttributeTypesEnum } from "../enums/attribute-types.enum";
import { AttributeValues } from "./attribute-values.type";

@ObjectType()
@Entity("product_attributes")
export class Attribute extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: "product_attributes_id" })
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field(() => AttributeValues, { nullable: true })
  @Column("jsonb", { nullable: true })
  values: AttributeValues;

  @Field(() => AttributeTypesEnum)
  @Column("enum", { enum: AttributeTypesEnum })
  type: AttributeTypesEnum;

  @Field(() => Uom, { nullable: true })
  @ManyToOne(() => Uom, uom => uom.attributes, { nullable: true })
  uom: Promise<Uom>;
  @Column({ nullable: true })
  uomId: number;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isPublic: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isRequired: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isFilterable: boolean;

  @Field(() => [Category], { nullable: "items" })
  @ManyToMany(() => Category, category => category.attributes)
  @JoinTable({
    name: "product_attribute_categories",
    joinColumn: { name: "attributeId" },
    inverseJoinColumn: { name: "categoryId" },
  })
  categories: Promise<Category[]>;

  @Field(() => [AttributeValue], { nullable: "items" })
  @OneToMany(() => AttributeValue, attributeValue => attributeValue.attribute)
  attributeValues: AttributeValue[];

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: false })
  createdBy: Promise<User>;
  @Column({ nullable: true })
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
  attribute: { options?: { [key: string]: string }; defaults?: string[] };
}
