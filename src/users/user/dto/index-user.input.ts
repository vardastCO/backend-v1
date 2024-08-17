import { Field, InputType,Int } from "@nestjs/graphql";
import { IsOptional,IsArray,IsInt } from "class-validator";
import { IndexInput } from "../../../base/utilities/dto/index.input";
import { UserStatusesEnum } from "../enums/user-statuses.enum";

@InputType()
export class IndexUserInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  status?: UserStatusesEnum;

  @Field({ nullable: true })
  @IsOptional()
  displayRoleId?: number;

  @Field({ nullable: true })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  cellphone?: string;

  @Field({ nullable: true })
  @IsOptional()
  national_code?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}
