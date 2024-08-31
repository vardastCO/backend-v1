import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { MaxLength, Length, IsOptional, IsString } from "class-validator";

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(255)
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(255)
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  identificationCode: string;

  @Field({ nullable: true })
  @IsOptional()
  birth: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name_company: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  national_id: string;
}
