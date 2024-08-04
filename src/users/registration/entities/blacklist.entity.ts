import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, BaseEntity } from 'typeorm';
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity()
export class Blacklist  extends BaseEntity  {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({unique:true })
  @Index()
  cellphone: string;

  @Field({nullable: true})
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

}
