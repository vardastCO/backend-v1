import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { ContactInfoRelatedTypes } from "../enums/contact-info-related-types.enum";
import { ContactInfoTypes } from "../enums/contact-info-types.enum";

@InputType()
export class CreateContactInfoInput {
  @Field(() => ContactInfoRelatedTypes)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsEnum(ContactInfoRelatedTypes)
  relatedType: ContactInfoRelatedTypes;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  relatedId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({nullable : true})
  @IsOptional()
  @IsInt()
  countryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  code?: string;

  @Field()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(255)
  number: string;

  @Field({ nullable: true })
  @IsOptional()
  ext?: string;

  @Field(() => ContactInfoTypes)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsEnum(ContactInfoTypes)
  type: ContactInfoTypes;

  @Field(() => Int, {
    nullable: true,
    description: "First Contact with sort 0 is considered primary.",
  })
  @IsOptional()
  @IsInt()
  sort?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => ThreeStateSupervisionStatuses)
  @IsNotEmpty()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  rejectionReason: string;
}
