import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class RefreshInput {
  @Field()
  @IsNotEmpty()
  accessToken: string;

  @Field()
  @IsNotEmpty()
  refreshToken: string;
}
