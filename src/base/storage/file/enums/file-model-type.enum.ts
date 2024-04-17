import { registerEnumType } from "@nestjs/graphql";

export enum FileModelTypeEnum {
  SHORT_BANNER = "SHORT_BANNER",
  LONG_BANNER = "LONG_BANNER",
  SLIDER = "SLIDER",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  XLARGE = "XLARGE",
}

registerEnumType(FileModelTypeEnum, {
  name: "FileModelTypeEnum",
});
