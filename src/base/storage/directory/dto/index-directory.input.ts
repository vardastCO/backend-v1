import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexDirectoryInput extends IndexInput {
  @Field({ nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  relatedModel?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  relatedProperty?: string;
}
