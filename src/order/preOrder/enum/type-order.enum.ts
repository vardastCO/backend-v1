import { registerEnumType } from "@nestjs/graphql";

export enum TypeOrder {
  LEGAL = "LEGAL",
  REAL = "REAL",
}

registerEnumType(TypeOrder, {
  name: "TypeOrder",
});
