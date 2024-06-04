import { Field, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "../../role/entities/role.entity";
import { PermissionActionsEnum } from "../enums/permission-actions.enum";
import { PermissionClaimEnum } from "../enums/permission-claim.enum";

@ObjectType()
@Entity("users_authorization_permissions")
export class Permission extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  displayName: string;

  @Field(() => PermissionActionsEnum)
  @Column()
  action: PermissionActionsEnum;

  @Field({ nullable: true })
  @Column({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  field?: string;

  @Field(() => PermissionClaimEnum)
  @Column("enum", {
    enum: PermissionClaimEnum,
    default: PermissionClaimEnum.GENERAL,
  })
  claim: PermissionClaimEnum;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column("jsonb", { nullable: true })
  conditions?: Array<object>;

  @Field(() => [Role], { nullable: true })
  @ManyToMany(type => Role, role => role.permissions, { cascade: true })
  roles: Role[];

  @Field(() => [User], { nullable: true })
  @ManyToMany(type => User, user => user.permissions)
  users: User[];
}
