import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DeletionReasons } from "../enums/deletion-reasons.enum";

@ObjectType()
@Entity("user_sessions")
export class Session extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.sessions)
  user: Promise<User>;
  @Column()
  userId: number;

  @Field()
  @Column()
  agent: string;

  @Field()
  @Column()
  loginIp: string;

  @Field()
  lastActiveIp: string; // calculated

  @Field()
  lastActivityAt: Date; // calculated

  @Field({ nullable: true })
  @Column("enum", { enum: DeletionReasons, nullable: true })
  deletionReason?: DeletionReasons;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  populateLastActiveIp(): void {
    this.lastActiveIp = this.loginIp;
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  populateLastActivityAt(): void {
    this.lastActivityAt = this.createdAt;
  }
}
