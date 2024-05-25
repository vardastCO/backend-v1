import { registerEnumType } from "@nestjs/graphql";

export enum PreOrderStates {
  CREATED = 1,
  PENDING_INFO = 2,
  PENDING_LINE = 3,
  VERIFIED = 4,
}

registerEnumType(PreOrderStates, {
  name: "PreOrderStates",
});
