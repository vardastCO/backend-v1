import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEnum, IsInt, IsNotEmpty } from "class-validator";
import { ChartEnum } from "../enums/chart.enum";

@InputType()
export class ChartInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @Field(() => ChartEnum, {
    defaultValue: ChartEnum.WEEKLY,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(ChartEnum)
  type: ChartEnum = ChartEnum.WEEKLY;
}
