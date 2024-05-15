import { registerEnumType } from "@nestjs/graphql";

export enum TypeOrderOffer {
  CLIENT = "1",
  SELLER = "2",
  VARDAST = "3",
}

registerEnumType(TypeOrderOffer, {
  name: "TypeOrderOffer",
});
