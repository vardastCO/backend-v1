import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SellerRepresentative } from "./seller-representative.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Seller } from "./seller.entity";

@ObjectType()
@Entity("seller_has_brand")
export class SellerHasBrand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Define foreign key for Seller
  @ManyToOne(() => Seller, seller => seller.brands)
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;
  @Column()
  sellerId: number;

  // Define foreign key for Brand
  @ManyToOne(() => Brand, brand => brand.sellers)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;
  @Column()
  brandId: number;
}
