import { registerEnumType } from "@nestjs/graphql";

export enum UserType {
  LEGAL = "LEGAL",
  REAL = "REAL",
}

registerEnumType(UserType, {
  name: "UserType",
});
