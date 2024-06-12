import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/entities/user.entity";
import { Legal } from "src/users/legal/entities/legal.entity";
import { UserType } from "../enums/type-user.enum";

@ObjectType()
export class RefreshResponse {
  @Field({
    description:
      "Put this access token as bearer auth token in header of every request.",
  })
  accessToken: string;

  @Field(type => UserType)
  type: UserType;

  @Field(type => Int, {
    description: "Access token validity period in seconds.",
  })
  accessTokenTtl: number;

  @Field()
  refreshToken: string;

  @Field(type => Int, {
    description: "Refresh token validity period in seconds.",
  })
  refreshTokenTtl: number;

  @Field(() => User)
  user: User;

  @Field(() => Legal, { nullable: true })
  legal: Legal;

  @Field(() => [String], { nullable: "items" })
  abilities: string[];
}
