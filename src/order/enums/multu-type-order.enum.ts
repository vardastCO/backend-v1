import { registerEnumType } from "@nestjs/graphql";

export enum MultiTypeOrder {
  PRODUCT = "1",
  SERVICE = "2",
}

registerEnumType(MultiTypeOrder, {
  name: "MultiTypeOrder",
});
