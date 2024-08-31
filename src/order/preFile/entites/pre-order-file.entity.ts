import { Field, Int, ObjectType } from "@nestjs/graphql";
import { File } from "src/base/storage/file/entities/file.entity";
import { PreOrder } from "src/order/preOrder/entities/pre-order.entity";
import {
  BaseEntity,
  Column,
  JoinColumn,
  Entity,
  OneToOne,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity("pre_order_file")
export class PreOrderFile extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => PreOrder)
  @ManyToOne(() => PreOrder, { eager: true })
  preOrder: Promise<PreOrder>;
  @Index()
  @Column()
  preOrderId: number;

  @Field(() => File)
  @OneToOne(() => File, file => null, { eager: true })
  @JoinColumn()
  file: Promise<File>;
  @Index()
  @Column()
  fileId: number;

  @Field()
  @Index()
  @Column({ nullable: true })
  deleted_at: string;
}
