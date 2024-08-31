import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexBlackListInput extends IndexInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cellphone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;
}
