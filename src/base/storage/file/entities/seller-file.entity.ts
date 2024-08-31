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
import { SellerTypeEnum } from "../enums/seller-type.enum";

@ObjectType()
@Entity("seller_files")
export class SellerFile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sellerId: number;

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
    type: "enum",
    enum: SellerTypeEnum,
    default: SellerTypeEnum.LOGO,
  })
  type: SellerTypeEnum;
}
