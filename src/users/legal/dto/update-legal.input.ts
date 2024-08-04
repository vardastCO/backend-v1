import { Field, InputType, PartialType } from "@nestjs/graphql";
import {
  Length,
} from "class-validator";
import { CreateLegalInput } from "./create-legal.input";

@InputType()
export class UpdateLegalInput extends PartialType(CreateLegalInput) {
  @Field({ nullable: true })
  name_company?: string;

  @Field({ nullable: true })
  @Length(11, 11, { message: " شناسه ملی یازده رقمی باید باشد" })
  national_id?: string;

  @Field({nullable:true})
  cellphone?: string;
}
