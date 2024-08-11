import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  IsString,
  MaxLength,
} from "class-validator";
import { TypeProject } from "../enums/type-project.enum";


@InputType()
export class CreateProjectInput {

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  // @Field(() => TypeProject, {
  //   defaultValue: TypeProject.LEGAL,
  //   nullable: true,
  // })
  // @IsNotEmpty()
  // @IsEnum(TypeProject)
  // type?: TypeProject = TypeProject.LEGAL;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  legalId?: number;  

  // @Field({ nullable: true })
  // @IsOptional()
  // @Length(11, 11, { message: "شماره همراه یازده رقمی باید باشد" })
  // cellphone?: string;

}
