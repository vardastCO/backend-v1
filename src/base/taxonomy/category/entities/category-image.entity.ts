import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";

@ObjectType()
@Entity("category_images")
export class ImageCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category?.imageCategory)
  category: Promise<Category>;
  @Column()
  categoryId: number;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Column()
  fileId: number;
}
