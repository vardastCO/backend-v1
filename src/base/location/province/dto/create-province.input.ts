import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { IsUnique } from "../../../utilities/validations/is-unique.validation";
import { Country } from "../../country/entities/country.entity";
import { Province } from "../entities/province.entity";

@InputType()
export class CreateProvinceInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  nameEn: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Province])
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  path?: string;

  @Field(() => Int)
  @IsNotEmpty()
  sort: number;

  @Field(() => Boolean)
  @IsNotEmpty()
  isActive: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  longitude?: number;

  @Field(() => Int)
  @IsNotEmpty()
  countryId: number;
}
