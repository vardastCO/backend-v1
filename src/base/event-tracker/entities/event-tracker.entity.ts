import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user/entities/user.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EventTrackerSubjectTypes } from "../enums/event-tracker-subject-types.enum";
import { EventTrackerTypes } from "../enums/event-tracker-types.enum";

@ObjectType()
@Entity("base_event_tracker")
export class EventTracker extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => EventTrackerTypes)
  @Column("enum", { enum: EventTrackerTypes })
  type: EventTrackerTypes;

  @Field()
  @Column("inet")
  ipAddress: string;

  @Field()
  @Column()
  agent: string;

  @Field(() => EventTrackerSubjectTypes)
  @Column("enum", { enum: EventTrackerSubjectTypes })
  subjectType: EventTrackerSubjectTypes;

  @Field(() => Int)
  @Column()
  subjectId: number;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  url: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => null, { nullable: true })
  user: Promise<User>;
  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
