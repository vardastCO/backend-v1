import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNotEmpty, MaxLength, Validate } from "class-validator";
import { IsUnique } from "src/base/utilities/validations/is-unique.validation";
import { Uom } from "../entities/uom.entity";

@InputType()
export class CreateUomInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  @Validate(IsUnique, [Uom])
  name: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  @Validate(IsUnique, [Uom])
  slug: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  @Validate(IsUnique, [Uom])
  symbol: string;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
