import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { PermissionActionsEnum } from "../enums/permission-actions.enum";

@InputType()
export class IndexPermissionInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  subject?: string;

  @Field(type => PermissionActionsEnum, { nullable: true })
  @IsOptional()
  action?: PermissionActionsEnum;

  @Field({ nullable: true })
  @IsOptional()
  displayName?: string;
}
