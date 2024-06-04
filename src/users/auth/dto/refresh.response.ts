import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class RefreshResponse {
  @Field({
    description:
      "Put this access token as bearer auth token in header of every request.",
  })
  accessToken: string;

  @Field()
  type: string;

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

  @Field(() => [String], { nullable: "items" })
  abilities: string[];
}
