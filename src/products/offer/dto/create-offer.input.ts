import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

@InputType()
export class CreateOfferInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sellerId?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @Field(() => ThreeStateSupervisionStatuses, {
    defaultValue: ThreeStateSupervisionStatuses.PENDING,
  })
  @IsOptional()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses = ThreeStateSupervisionStatuses.PENDING;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean;
}
