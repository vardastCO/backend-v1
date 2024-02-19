import { Field, InputType } from "@nestjs/graphql";
import { IsOptional,IsString } from "class-validator";

@InputType()
export class SearchSellerRepresentativeInput  {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
