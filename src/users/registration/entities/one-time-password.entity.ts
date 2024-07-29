import { Field, Int, ObjectType } from "@nestjs/graphql";
import * as argon2 from "argon2";
import { generateSecureRandomNumberString } from "src/base/utilities/helpers";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OneTimePasswordStates } from "../enums/one-time-password-states.enum";
import { OneTimePasswordTypes } from "../enums/one-time-password-types.enum";

@ObjectType()
@Entity("user_one_time_passwords")
export class OneTimePassword extends BaseEntity {
  public static SMS_OTP_EXPIRES_IN_SECONDS = 120;
  public static SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS = 1_200; // 20 min

  @Field(() => Int)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => OneTimePasswordTypes)
  @Column()
  type: OneTimePasswordTypes;

  @Field()
  @Column()
  @Index()
  receiver: string;

  @Column()
  token: string;

  @Field(() => OneTimePasswordStates)
  @Column("enum", {
    enum: OneTimePasswordStates,
    default: OneTimePasswordStates.INIT,
  })
  state: OneTimePasswordStates;

  @Field()
  @Column("inet")
  requesterIp: string;

  @Field(() => Date, { nullable: true })
  @Column("timestamp", { nullable: true })
  validatedAt?: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  generateNewToken(): this {
    this.token = generateSecureRandomNumberString(5);
    return this;
  }

  async hashTheToken(): Promise<this> {
    this.token = await argon2.hash(this.token);
    return this;
  }

  async doesTokenMatches(rawToken: string): Promise<boolean> {
    return await argon2.verify(this.token, rawToken);
  }
}
