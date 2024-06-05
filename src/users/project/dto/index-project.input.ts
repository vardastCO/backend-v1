import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsDateString ,IsString,IsEnum} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ThreeStateSupervisionStatuses } from "src/order/enums/three-state-supervision-statuses.enum";


@InputType()
export class IndexProjectInput extends IndexInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  createTime?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

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

  @Field(() => ThreeStateSupervisionStatuses, { nullable: true })
  @IsOptional()
  @IsEnum(ThreeStateSupervisionStatuses)
  status?: ThreeStateSupervisionStatuses;
}
