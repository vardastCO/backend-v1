import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { SellerRepresentativeRoles } from "../enums/seller-representative-roles.enum";

@InputType()
export class CreateSellerRepresentativeInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  sellerId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  userId: number;

  @Field(() => SellerRepresentativeRoles)
  @IsNotEmpty()
  @IsEnum(SellerRepresentativeRoles)
  role: SellerRepresentativeRoles;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field({ defaultValue: false })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
