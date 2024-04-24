import { Field, Int, ObjectType } from "@nestjs/graphql";
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
import { File } from "./file.entity";
import { BrandTypeEnum } from "../enums/brnad-type.enum";

@ObjectType()
@Entity("brand_files")
export class BrandFile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brandId: number;
  
  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => Int)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Column({
    type: 'enum',
    enum: BrandTypeEnum,
    default: BrandTypeEnum.LOGO 
  })
  type: BrandTypeEnum;
}
