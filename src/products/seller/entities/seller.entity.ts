import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { Offer } from "src/products/offer/entities/offer.entity";
import { Price } from "src/products/price/entities/price.entity";
import { Address } from "src/users/address/entities/address.entity";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { User } from "src/users/user/entities/user.entity";
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

@ObjectType()
@Entity("product_sellers")
export class Seller extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  

  @Field(() => Int, { nullable:true ,defaultValue: 1 })
  @Column( {nullable: true } )
  sum : number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  bio?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  tag?: string;

  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  rating?: number= 4;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  logoFile: Promise<File>;
  // logoFileId: number;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  bannerFile: Promise<File>;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  @Field(() => Boolean)
  @Column("boolean", { default: true })
  isPublic: boolean;

  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  brandsCount?: number = 0;
  
  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  categoriesCount?: number= 0;

  @Field(() => Boolean)
  @Column("boolean", { default: false })
  isBlueTik: boolean;

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

  @Field(() => [Price], { nullable: "items" })
  @OneToMany(() => Price, price => price.seller)
  prices: Promise<Price[]>;

  @Field(() => [Offer], { nullable: "items" })
  @OneToMany(() => Offer, offer => offer.seller)
  offers: Promise<Offer[]>;

  @Field(() => [Offer], { nullable: "items" })
  @OneToMany(() => Offer, offer => offer.seller)
  myProduct: Promise<Offer[]>;

  @Field(() => [Brand], { nullable: "items" })
  @OneToMany(() => Brand, brand => null, { nullable: true } )
  brands: Brand[];

  @Field(() => [ContactInfo])
  @OneToMany(() => ContactInfo, contactInfo => null, { nullable: true })
  contacts: ContactInfo[];

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field(() => [SellerRepresentative])
  @OneToMany(
    () => SellerRepresentative,
    representative => representative.seller,
  )
  representatives: Promise<SellerRepresentative[]>;

  get myProductLength(): Promise<number> {
    return this.myProduct.then(offers => offers.length);
  }
  

}
