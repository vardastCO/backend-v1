import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { IsUnique } from "../../../utilities/validations/is-unique.validation";
import { Country } from "../entities/country.entity";
import { IsSlug } from "src/base/utilities/validations/is-slug.validation";

@InputType()
export class CreateCountryInput {
  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Country])
  name: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Country])
  nameEn: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsSlug)
  @Validate(IsUnique, [Country])
  slug: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Country])
  alphaTwo: string;

  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Country])
  iso: string;

  @Field()
  @IsNotEmpty()
  phonePrefix: string;

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
}
