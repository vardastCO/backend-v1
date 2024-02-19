import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ContactInfoRelatedTypes } from "../enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "../enums/contact-info-types.enum";

@InputType()
@InputType()
export class IndexContactInfoInput extends IndexInput {
  @Field(() => ContactInfoRelatedTypes)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsEnum(ContactInfoRelatedTypes)
  relatedType?: ContactInfoRelatedTypes;

  @Field(() => Int)
  @IsOptional()
  @IsInt()
  relatedId?: number;

  @Field(() => Int)
  @IsOptional()
  @IsInt()
  countryId?: number;

  @Field(() => ContactInfoTypes)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsEnum(ContactInfoTypes)
  type?: ContactInfoTypes;

  @Field(() => Int, {
    description: "First Contact with sort 0 is considered primary.",
  })
  @IsOptional()
  @IsInt()
  sort?: number;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
