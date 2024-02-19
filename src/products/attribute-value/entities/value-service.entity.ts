import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
@Index("idx_value", ["value"])
@ObjectType()
@Entity("values_product_service")
export class ValuesService extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;
  
  @Field()
  @Column()
  value: string;
  
}
