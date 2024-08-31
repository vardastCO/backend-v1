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
import { Seller } from "../entities/seller.entity";

@InputType()
export class BecomeASellerInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Validate(IsUnique, [Seller])
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2047)
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID("4")
  logoFileUuid: string;
}
