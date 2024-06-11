import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { MemberRoles } from "../enums/member.enum";
import { TypeMember } from "../enums/type-member.enum";

@ObjectType()
@Entity("members")
export class Member extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  relatedId: number;

  @Field(() => MemberRoles)
  @IsNotEmpty()
  @IsEnum(MemberRoles)
  role: MemberRoles;

  @Field(() => TypeMember)
  @Column("enum", {
    enum: TypeMember,
    default: TypeMember.LEGAL,
  })
  type: TypeMember;

  @Field(() => User)
  @ManyToOne(() => User, user => null)
  user: Promise<User>;
  @Column()
  userId: number;

  @Field()
  @Column("boolean", { default: false })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
