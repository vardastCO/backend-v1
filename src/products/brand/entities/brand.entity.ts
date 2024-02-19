import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { Product } from "src/products/product/entities/product.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";


@ObjectType()
@Entity("product_brands")
@Index("idx_brand_name", ["name"])
export class Brand extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => Int, { defaultValue: 1 })
  @Column( )
  sum : number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  slug?: string;

  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  rating?: number = 4;

  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  sellersCount?: number = 0;
  
  @Field(() => Int, { nullable: true })
  @Column( {nullable: true })
  categoriesCount?: number= 0;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  logoFile: Promise<File>;
  // @Column({ nullable: true })
  // logoFileId: number;


  @Field({ nullable: true })
  @Column({nullable: true })
  bio?: string;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  bannerFile: Promise<File>;

  @Field(type => [Product], { nullable: "items" })
  @OneToMany(type => Product, product => product.brand)
  products: Promise<Product[]>;
  

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  catalog: Promise<File>;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  priceList: Promise<File>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;


}
