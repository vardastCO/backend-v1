import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexLegalInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameOrUuid?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  national_id?: string;
}
