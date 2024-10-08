import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { Product } from "src/products/product/entities/product.entity";
import { Address } from "src/users/address/entities/address.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name_en?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name_fa?: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { nullable: true })
  category: Promise<Category | null>;

  @Index()
  @Column({ nullable: true })
  categoryId: number | null;

  @Field(() => ThreeStateSupervisionStatuses)
  @Column("enum", {
    enum: ThreeStateSupervisionStatuses,
    default: ThreeStateSupervisionStatuses.CONFIRMED,
  })
  status: ThreeStateSupervisionStatuses;

  @Field(() => Int, { defaultValue: 1 })
  @Column()
  sum: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @Column({ type: "int", nullable: true, default: 1 })
  views?: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  slug?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rating?: number = 4;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  sellersCount?: number = 0;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  categoriesCount?: number = 0;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  logoFile: Promise<File>;
  // @Column({ nullable: true })
  // logoFileId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio?: string;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  bannerFile: Promise<File>;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  bannerDesktop: Promise<File>;

  @Field(() => [Address])
  @OneToMany(() => Address, address => null, { nullable: true })
  addresses: Address[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  cityId?: number;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, file => null, { eager: true, nullable: true })
  @JoinColumn()
  bannerMobile: Promise<File>;

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

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @BeforeInsert()
  @BeforeUpdate()
  async generateName(): Promise<void> {
    if (this.name_fa && this.name_en) {
      this.name = `${this.name_fa} (${this.name_en})`;
    } else if (this.name_fa) {
      this.name = this.name_fa;
    }
  }
}
