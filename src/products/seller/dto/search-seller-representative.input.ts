import { Field, InputType } from "@nestjs/graphql";
import { IsOptional,IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class SearchSellerRepresentativeInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
