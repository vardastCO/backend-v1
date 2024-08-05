import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import {
  IsEnum,
  IsInt, IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length
} from "class-validator";
import { LegalStateEnum } from "../enum/legalState.enum";
import { LegalStatusEnum } from "../enum/legalStatus.enum";
import { CreateLegalInput } from "./create-legal.input";

@InputType()
export class UpdateLegalInput extends PartialType(CreateLegalInput) {

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;

  @Field({ nullable: true })
  name_company?: string;

  @Field({ nullable: true })
  @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  national_id?: string;

  @Field({nullable:true})
  cellphone?: string;

  @Field(() => LegalStatusEnum, {
    defaultValue: LegalStatusEnum.IN_ACTIVE,
    nullable: true,
  })
  @IsEnum(LegalStatusEnum)
  status?: LegalStatusEnum = LegalStatusEnum.IN_ACTIVE;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  wallet?: string;


  @Field(() => LegalStateEnum, {
  defaultValue: LegalStateEnum.PENDING_OWNER,
  nullable: true,
  })
  @IsEnum(LegalStateEnum)
  state?: LegalStateEnum = LegalStateEnum.PENDING_OWNER;
}
