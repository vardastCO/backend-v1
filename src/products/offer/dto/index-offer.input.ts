import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsEnum, IsInt, IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

@InputType()
export class IndexOfferInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sellerId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => ThreeStateSupervisionStatuses, { nullable: true })
  @IsOptional()
  @IsEnum(ThreeStateSupervisionStatuses)
  status?: ThreeStateSupervisionStatuses;
}
