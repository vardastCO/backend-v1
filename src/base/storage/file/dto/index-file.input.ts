import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexFileInput extends IndexInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  directoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mimeType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  disk?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bucketName?: string;
}
