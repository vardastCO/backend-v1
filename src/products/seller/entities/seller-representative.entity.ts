import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SellerRepresentativeRoles } from "../enums/seller-representative-roles.enum";
import { Seller } from "./seller.entity";

@ObjectType()
@Entity("product_seller_representatives")
export class SellerRepresentative extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Seller)
  @ManyToOne(() => Seller, seller => seller.representatives)
  seller: Promise<Seller>;
  @Column()
  sellerId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => null)
  user: Promise<User>;
  @Column()
  userId: number;

  @Field(() => SellerRepresentativeRoles)
  @Column("enum", { enum: SellerRepresentativeRoles })
  role: SellerRepresentativeRoles;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field()
  @Column("boolean", { default: false })
  isActive: boolean;

  @Field(() => User)
  @ManyToOne(() => User)
  createdBy: User;
  @Column()
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
