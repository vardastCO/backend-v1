import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from "class-validator";
import { IsUnique } from "src/base/utilities/validations/is-unique.validation";
import { Brand } from "../entities/brand.entity";

@InputType()
export class CreateBrandInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  // @MaxLength(255)
  // @Validate(IsUnique, [Brand])
  name_fa: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name_en: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID("4")
  logoFileUuid?: string;
}
