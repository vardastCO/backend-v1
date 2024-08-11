import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { AddressRelatedTypes } from "../enums/address-related-types.enum";

@InputType()
export class IndexAddressInput extends IndexInput {
  @Field(() => AddressRelatedTypes)
  @IsNotEmpty()
  @IsEnum(AddressRelatedTypes)
  relatedType: AddressRelatedTypes;

  // @Field(() => Int)
  // @IsNotEmpty()
  // @IsInt()
  // @IsPositive()
  // relatedId: number;

  // @Field(() => Int)
  // @IsNotEmpty()
  // @IsInt()
  // @IsPositive()
  // provinceId: number;

  // @Field(() => Int)
  // @IsNotEmpty()
  // @IsInt()
  // @IsPositive()
  // cityId: number;

  // @Field()
  // @IsNotEmpty()
  // @IsBoolean()
  // isPublic: boolean;
}
