import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { MaxLength, IsNotEmpty,IsOptional,IsString } from "class-validator";

@InputType()
export class UpdateProfileInput  {
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

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_company: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  national_id: string;
}
