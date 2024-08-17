import { Field, InputType, Int } from "@nestjs/graphql";
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { IndexInput } from "../../../base/utilities/dto/index.input";
import { UserStatusesEnum } from "../enums/user-statuses.enum";

@InputType()
export class IndexUserInput extends IndexInput {
  @Field(() => UserStatusesEnum, {
    nullable: true
  })
  @IsOptional()
  @IsEnum(UserStatusesEnum)
  status?: UserStatusesEnum;
  
  @Field({ nullable: true })
  @IsOptional()
  displayRoleId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  birth?: Date; 

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cellphone?: string;
  
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}