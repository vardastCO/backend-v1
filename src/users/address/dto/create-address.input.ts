import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { AddressRelatedTypes } from "../enums/address-related-types.enum";

@InputType()
export class CreateAddressInput {
  @Field(() => AddressRelatedTypes)
  @IsNotEmpty()
  @IsEnum(AddressRelatedTypes)
  relatedType: AddressRelatedTypes;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  relatedId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  countryId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  provinceId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  cityId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field(() => Int, {
    description: "First Address with sort 0 is considered primary.",
  })
  @IsOptional()
  @IsInt()
  sort?: number;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => ThreeStateSupervisionStatuses)
  @IsNotEmpty()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;
}
