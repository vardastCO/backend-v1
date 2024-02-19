// src/options/dto/option.dto.ts

import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
} from "class-validator";

@InputType()
export class CreateOptionInput {
  @Field(() => [Int])
  @IsNotEmpty()
  @IsInt({ each: true })
  productIds: number[];

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  attributeId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  valueId: number;
}
