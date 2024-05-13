import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { MaxLength, IsNotEmpty,IsOptional } from "class-validator";

@InputType()
export class UpdateProfileInput  {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  email: string;
}
