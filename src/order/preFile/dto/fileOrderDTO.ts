import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FileOrderDTO {
  @Field(() => Int)
  id: number;
  @Field()
  url: string;
}
