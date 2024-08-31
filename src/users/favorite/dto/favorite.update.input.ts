// src/create-favorite.input.ts
import { Field, InputType, Int } from "@nestjs/graphql";
import { EntityTypeEnum } from "../enums/entity-type.enum";
import { IsEnum, IsNotEmpty } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
@InputType()
export class UpdateFavoriteInput extends IndexInput {
  @Field(() => Int)
  @IsNotEmpty()
  entityId: number;

  @Field(() => EntityTypeEnum, { nullable: true })
  @IsNotEmpty()
  @IsEnum(EntityTypeEnum)
  type: EntityTypeEnum;
}
