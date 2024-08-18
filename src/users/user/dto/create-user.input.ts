import { BadRequestException } from "@nestjs/common";

import { Field, InputType, Int } from "@nestjs/graphql";
import { hash } from "argon2";
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  MaxLength,
  ValidateIf
} from "class-validator";
import { Country } from "src/base/location/country/entities/country.entity";
import { CellphoneUtil } from "src/base/utilities/cellphone.util";
import { DataSource } from "typeorm";
import { UserLanguagesEnum } from "../enums/user-languages.enum";
import { UserStatusesEnum } from "../enums/user-statuses.enum";
import { UserConfig } from "../user.config";

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @Field({ nullable: true })
  @ValidateIf(object => UserConfig.usernameField === "email")
  @IsOptional()
  @IsEmail(null, { always: true })
  email?: string;

  @Field({ nullable: true })
  @ValidateIf(object => UserConfig.usernameField === "cellphone")
  @IsNotEmpty()
  @IsMobilePhone(null, null, { always: true })
  cellphone: string;

  username: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password?: string;

  @Field({nullable:true})
  @IsOptional()
  @MaxLength(10)
  nationalCode?: string;

  @Field({nullable:true})
  @IsOptional()
  mustChangePassword?: boolean;

  @Field(() => UserLanguagesEnum, {
    defaultValue: UserLanguagesEnum.FARSI,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(UserLanguagesEnum)
  language?: UserLanguagesEnum = UserLanguagesEnum.FARSI;

  // @Field({nullable:true})
  // @IsOptional()
  // @IsTimeZone()
  // timezone: string;

  // @Field({nullable:true})
  // @IsOptional()
  // @IsInt()
  // @IsPositive()
  // countryId?: number;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsUUID("4")
  // avatarUuid?: string;

  @Field(type => UserStatusesEnum, {
    defaultValue: UserStatusesEnum.ACTIVE,
  })
  @IsOptional()
  status: UserStatusesEnum;

  // @Field({ nullable: true })
  // @IsOptional()
  // suspensionReason?: string;

  @Field(type => Int,{nullable:true})
  @IsOptional()
  displayRoleId?: number;

  // @Field({ nullable: true })
  // @IsOptional()
  // customDisplayRole?: string;

  // @Field({ nullable: true })
  // @IsOptional()
  // adminComments?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsInt({ each: true })
  roleIds: number[];

  // @Field(() => [Int], { nullable: true })
  // @IsOptional()
  // @IsInt({ each: true })
  // permissionIds: number[];

  protected setUsernameProperty(): this {
    this.username = this[UserConfig.usernameField];
    return this;
  }

  protected async validateAndFormatCellphone(
    dataSource: DataSource,
  ): Promise<this> {
    if (!this.cellphone) {
      return this;
    }

    if (!this.cellphone.startsWith("0")) {
      this.cellphone = "0" + this.cellphone;
    }

    const country: Country = await dataSource
      .getRepository(Country)
      .findOneBy({ id: Country.IR });

    const cellphoneUtil = new CellphoneUtil(this.cellphone, country.alphaTwo);
    if (!cellphoneUtil.isValid()) {
      throw new BadRequestException(
        "The provided cellphone number does not match the countries cellphone format",
      );
    }

    this.cellphone = cellphoneUtil.localNumber();
    return this;
  }

  protected async hashPassword(): Promise<this> {
    this.password = await hash(this.password);
    return this;
  }

  async prepare(dataSource: DataSource): Promise<this> {
    return (await this.validateAndFormatCellphone(dataSource))
      .setUsernameProperty()
      .hashPassword();
  }
}
