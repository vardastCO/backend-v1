import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { TypeMember } from "../enums/type-member.enum";
import { MemberRoles } from "../enums/member.enum";

@InputType()
export class CreateMemberInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  relatedId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cellphone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  position: string;

  @Field(() => TypeMember, { defaultValue: TypeMember.LEGAL })
  @IsNotEmpty()
  @IsEnum(TypeMember)
  typeMember: TypeMember;

  @Field(() => MemberRoles, { defaultValue: MemberRoles.ADMIN })
  @IsNotEmpty()
  @IsEnum(MemberRoles)
  role: MemberRoles;

  @Field({ defaultValue: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
