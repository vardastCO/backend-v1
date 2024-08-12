import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { UserTypeProject } from "../enums/type-user-project.enum";


@InputType()
export class CreateUserProjectInput {

  @Field()
  @IsNotEmpty()
  @IsInt()
  memberId: number;

  @Field()
  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @Field(() => UserTypeProject)
  @IsNotEmpty()
  @IsEnum(UserTypeProject)
  type: UserTypeProject;

}
