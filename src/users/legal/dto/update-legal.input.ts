import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateLegalInput } from "./create-legal.input";

@InputType()
export class UpdateLegalInput extends PartialType(CreateLegalInput) {
  @Field({ nullable: true })
  name_company?: string;

  @Field({ nullable: true })
  national_id?: string;

  @Field({nullable:true})
  cellphone?: string;
}
