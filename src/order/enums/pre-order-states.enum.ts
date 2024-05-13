import { registerEnumType } from "@nestjs/graphql";

export enum PreOrderStates {
  CREATED = 1,
  ADDEDLINE = 2,
  ADDEDADRESS = 3,
  ADDPRICE = 4,
}

registerEnumType(PreOrderStates, {
  name: "PreOrderStates",
});
