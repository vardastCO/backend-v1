import { registerEnumType } from "@nestjs/graphql";

export enum CityTypesEnum {
  COUNTY = 1,
  BAKHSH = 2,
  CITY = 3,
}

registerEnumType(CityTypesEnum, { name: "CityTypesEnum" });
