import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { MemberRoles } from "../enums/member.enum";
import { TypeMember } from "../enums/type-member.enum";

@ObjectType()
@Unique(["relatedId", "userId"])
@Entity("members")
export class Member extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  relatedId: number;

  @Field(() => MemberRoles)
  @Column("enum", {
    enum: MemberRoles,
    default: MemberRoles.ADMIN,
  })
  role: MemberRoles;

  @Field(() => TypeMember)
  @Column("enum", {
    enum: TypeMember,
    default: TypeMember.LEGAL
  })
  type: TypeMember;

  @Field(() => User)
  @ManyToOne(() => User, user => null)
  user: Promise<User>;
  @Column()
  userId: number;

  // @Field(() => User)
  // @ManyToOne(() => User, user => null)
  // admin: Promise<User>;
  // @Column()
  // adminId: number;

  @Field()
  @Column("boolean", { default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true  })
  position?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
