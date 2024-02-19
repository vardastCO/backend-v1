import { registerEnumType } from "@nestjs/graphql";

export enum UserLanguagesEnum {
  FARSI = "fa",
  ENGLISH = "en",
}

registerEnumType(UserLanguagesEnum, { name: "UserLanguagesEnum" });
