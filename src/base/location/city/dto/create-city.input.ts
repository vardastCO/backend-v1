import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { CityTypesEnum } from "../enums/city-types.enum";
import { IsUnique } from "../../../utilities/validations/is-unique.validation";
import { Country } from "../../country/entities/country.entity";
import { City } from "../entities/city.entity";

@InputType()
export class CreateCityInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  nameEn: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [City])
  slug: string;

  @Field(type => CityTypesEnum)
  @IsNotEmpty()
  type: CityTypesEnum;

  @Field(() => Int)
  @IsNotEmpty()
  sort: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  isActive: boolean;

  @Field(() => Int)
  @IsNotEmpty()
  provinceId?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  longitude?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  parentCityId?: number;
}
