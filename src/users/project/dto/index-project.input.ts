import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsDateString, IsString, IsEnum } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ThreeStateSupervisionStatuses } from "src/order/enums/three-state-supervision-statuses.enum";
import { MultiStatuses } from "../enums/multi-statuses.enum";

@InputType()
export class IndexProjectInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameOrUuid?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameManager?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameEmployer?: string;

  @Field(() => MultiStatuses, { nullable: true })
  @IsOptional()
  @IsEnum(MultiStatuses)
  status?: MultiStatuses;
}
