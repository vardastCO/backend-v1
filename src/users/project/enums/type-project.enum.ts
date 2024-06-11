import { registerEnumType } from "@nestjs/graphql";

export enum TypeProject {
  LEGAL = "LEGAL",
  REAL = "REAL",
}

registerEnumType(TypeProject, {
  name: "TypeProject",
});
