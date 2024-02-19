// src/create-favorite.input.ts
import { Field, InputType } from "@nestjs/graphql";
import { EntityTypeEnum } from "../enums/entity-type.enum";
import {
  IsEnum,IsNotEmpty
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
@InputType()
export class EntityTypeInput extends IndexInput  {
  @Field(() => EntityTypeEnum, { nullable: true })
  @IsNotEmpty()
  @IsEnum(EntityTypeEnum)
  type: EntityTypeEnum;
}
