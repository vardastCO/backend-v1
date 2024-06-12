import { registerEnumType } from "@nestjs/graphql";

export enum TypeUser {
  LEGAL = "LEGAL",
  REAL = "REAL",
}

registerEnumType(TypeUser, {
  name: "TypeUser",
});
