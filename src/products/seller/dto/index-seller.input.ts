import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional,IsEnum ,IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
@InputType()
export class IndexSellerInput extends IndexInput {
  @Field(() => ThreeStateSupervisionStatuses, { nullable: true })
  @IsOptional()
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasLogoFile?: boolean ;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  createdById: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sort : (SortOrder);

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cityId : (SortOrder);
}