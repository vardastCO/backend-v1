import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsPositive, Validate } from "class-validator";
import { IsUnique } from "../../../utilities/validations/is-unique.validation";
import { Country } from "../../country/entities/country.entity";
import { Area } from "../entities/area.entity";

@InputType()
export class CreateAreaInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  nameEn: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Area])
  slug: string;

  @Field(() => Int)
  @IsNotEmpty()
  sort: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  isActive: boolean;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => Int)
  @IsPositive()
  @IsNotEmpty()
  cityId: number;
}
