import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { TypeMember } from "../enums/type-member.enum";

@InputType()
export class IndexMemberInput extends IndexInput {
  @Field(() => TypeMember)
  @IsNotEmpty()
  @IsEnum(TypeMember)
  type: TypeMember;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  relatedId?: number;
}
