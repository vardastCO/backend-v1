import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,
  Length,
  IsString,
  MaxLength,
  IsOptional
} from "class-validator";


@InputType()
export class CreateLegalInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_company: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  national_id: string;


  @Field({nullable:true})
  @IsOptional()
  @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  cellphone?: string;

}
