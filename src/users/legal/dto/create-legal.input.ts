import { Field, InputType } from "@nestjs/graphql";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength
} from "class-validator";
import { LegalStatusEnum } from "../enum/legalStatus.enum";


@InputType()
export class CreateLegalInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_company: string;

  @Field(() => LegalStatusEnum, {
    defaultValue: LegalStatusEnum.IN_ACTIVE,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(LegalStatusEnum)
  status?: LegalStatusEnum = LegalStatusEnum.IN_ACTIVE;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  national_id: string;


  @Field({ nullable: true })
  @IsOptional()
  @Length(11, 18, { message: " شماره حساب باید بین یزده تا هجده رقم باشد" })
  accountNumber?: string;
  
  @Field({ nullable: true })
  @MaxLength(26) 
  @IsString()
  @IsOptional()
  shabaNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  wallet?: string;

  @Field({nullable:true})
  @IsOptional()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone?: string;

  
}
