import { Field, InputType } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { IsUnique } from "src/base/utilities/validations/is-unique.validation";
import { Seller } from "../entities/seller.entity";

@InputType()
export class CreateSellerInput {
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
  @IsUUID("4")
  logoFileUuid: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  rating?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => ThreeStateSupervisionStatuses, {
    nullable: true,
    defaultValue: ThreeStateSupervisionStatuses.PENDING,
  })
  @IsOptional()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;
}
