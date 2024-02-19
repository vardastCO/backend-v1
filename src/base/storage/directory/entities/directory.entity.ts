import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { File } from "../../file/entities/file.entity";

@ObjectType()
@Entity("base_storage_directories")
export class Directory extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  path: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedModel?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedProperty?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  viewPermissionName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  uploadPermissionName?: string;

  @Field(() => [File], { nullable: "items" })
  @OneToMany(() => File, file => file.directory)
  files?: Promise<File[]>;
}
