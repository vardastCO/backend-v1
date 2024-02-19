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
  @MaxLength(255)
  @Validate(IsUnique, [Brand])
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Validate(IsUnique, [Brand])
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rating ?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID("4")
  logoFileUuid?: string;
}
