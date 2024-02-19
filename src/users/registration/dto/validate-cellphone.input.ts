import { BadRequestException } from "@nestjs/common";
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsEnum,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from "class-validator";
import { Country } from "src/base/location/country/entities/country.entity";
import { CellphoneUtil } from "src/base/utilities/cellphone.util";
import { ValidationTypes } from "../enums/validation-types.enum";

@InputType()
export class ValidateCellphoneInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  countryId: number;

  @Field()
  @IsNotEmpty()
  @IsMobilePhone(null, null, { always: true })
  cellphone: string;

  @Field(() => ValidationTypes, {
    defaultValue: ValidationTypes.SIGNUP,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(ValidationTypes)
  validationType?: ValidationTypes = ValidationTypes.SIGNUP;

  async validateAndFormatCellphone(): Promise<this> {
    if (!this.cellphone) {
      return this;
    }

    if (!this.cellphone.startsWith("0")) {
      this.cellphone = "0" + this.cellphone;
    }

    const country: Country = await Country.findOneBy({ id: this.countryId });

    const cellphoneUtil = new CellphoneUtil(this.cellphone, country.alphaTwo);
    if (!cellphoneUtil.isValid()) {
      throw new BadRequestException(
        "The provided cellphone number does not match the countries cellphone format",
      );
    }

    this.cellphone = cellphoneUtil.localNumber();
    return this;
  }
}
