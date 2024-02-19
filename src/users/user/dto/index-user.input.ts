import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
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
}
