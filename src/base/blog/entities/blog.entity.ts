import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity("blogs")
export class Blog extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true ,default:1})
  categoryId: number;

  // @Field({ nullable: true })
  // @Column({ nullable: true })
  // content: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image_url: string;

  // @OneToMany(() => BlogFile, blogFile => blogFile.blog)
  // files: BlogFile[];

  // @Field(() => Category)
  // @ManyToOne(() => Category, category => category)
  // category: Promise<Category>;

  // @Column()
  // categoryId: number;
}
