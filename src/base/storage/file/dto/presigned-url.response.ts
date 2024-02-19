import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PresignedUrlObject {
  @Field()
  url: string;

  @Field()
  expiresAt: Date;
}
