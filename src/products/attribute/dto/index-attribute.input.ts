import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { AttributeTypesEnum } from "../enums/attribute-types.enum";

@InputType()
export class IndexAttributeInput extends IndexInput {
  @Field(() => AttributeTypesEnum, { nullable: true })
  @IsOptional()
  type?: AttributeTypesEnum;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  uomId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  createdById?: number;
}
