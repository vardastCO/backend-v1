import { Field, Int, ObjectType } from "@nestjs/graphql";
import { randomBytes } from "crypto";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  IsNull,
  ManyToOne,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Directory } from "../../directory/entities/directory.entity";
import { PresignedUrlObject } from "../dto/presigned-url.response";
import { ImageCategory } from "src/base/taxonomy/category/entities/category-image.entity";

@ObjectType()
@Entity("base_storage_files")
export class File extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  @Generated("uuid")
  uuid: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  modelType: string;
  @Field(() => Int, { nullable: true })
  @Column("int8", { nullable: true })
  modelId: number;

  @Field(() => Directory)
  @ManyToOne(() => Directory, directory => directory.files)
  directory: Promise<Directory>;
  @Column()
  directoryId: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  originalName: string;

  @Field(() => Int)
  @Column({ type: "int4", unsigned: true, comment: "in bytes" })
  size: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  mimeType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field()
  @Column()
  disk: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bucketName: string;

  @Field(() => Int, { nullable: true })
  @Column("int4", { nullable: true })
  @Index()
  orderColumn: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: false })
  createdBy: Promise<User>;
  @Column({ nullable: true })
  createdById: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => PresignedUrlObject)
  presignedUrl: PresignedUrlObject;

  static generateNewFileName(file: { mimetype: string }): string {
    const extension = file.mimetype.split("/")[1];
    return `${randomBytes(16).toString("hex")}.${extension}`;
  }

  static async getNewlyUploadedFile(
    directory: string,
    uuid: string,
    modelType: string,
    createdById: number,
  ): Promise<File> {
    const files = await File.find({
      where: {
        directory: { path: directory },
        uuid,
        modelType,
        modelId: IsNull(),
        createdById,
      },
      relations: ["directory"],
    });
    return files.length > 0 ? files[0] : null;
  }
}
