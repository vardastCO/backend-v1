import { registerEnumType } from "@nestjs/graphql";

export enum MultiTypeUom {
  PAIR = "جفت",
  DEVICE = "دستگاه",
  SQUARE_METER = "مترمربع",
  CUBIC_METER = "متر مکعب",
  KILOGRAM = "کیلوگرم",
  METER = "متر",
  BRANCH = "شاخه",
  BAG = "کیسه",
  PIECE = "عدد",
}

registerEnumType(MultiTypeUom, {
  name: "MultiTypeUom",
});
