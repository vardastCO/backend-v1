import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexUomInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}
