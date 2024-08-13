import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from "class-validator";


@InputType()
export class CreateContactInput {

  @Field()
  @IsNotEmpty()
  fullname: string;

  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  cellphone: string;

  @Field()
  @IsNotEmpty()
  text: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileuuid?: string;
  
}
