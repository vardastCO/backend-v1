// src/options/option.entity.ts
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ValuesService } from "src/products/attribute-value/entities/value-service.entity";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Option } from "./option.entity";

@ObjectType()
@Entity()
export class OptionValue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Option)
  @ManyToOne(() => Option)
  option: Promise<Option>;
  @Index()
  @JoinColumn({ name: "optionId" })
  @Column()
  optionId: number;

  @Field(() => ValuesService)
  @ManyToOne(() => ValuesService)
  value: Promise<ValuesService>;
  @Index()
  @Column()
  valueId: number;
}
