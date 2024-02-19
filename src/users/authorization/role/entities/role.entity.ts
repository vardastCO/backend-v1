import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../user/entities/user.entity";
import { Permission } from "../../permission/entities/permission.entity";

@ObjectType()
@Entity("users_authorization_roles")
export class Role extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column()
  displayName: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  description: string;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Permission], { nullable: "items" })
  @JoinTable({
    name: "users_authorization_role_permissions",
    joinColumn: { name: "roleId" },
    inverseJoinColumn: { name: "permissionId" },
  })
  @ManyToMany(() => Permission, permission => permission.roles, {
    cascade: ["insert"],
  })
  permissions: Permission[];

  @Field(() => [User], { nullable: true })
  @ManyToMany(type => User, user => user.roles)
  users: User[];
}
