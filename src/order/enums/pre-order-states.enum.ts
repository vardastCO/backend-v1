import { registerEnumType } from "@nestjs/graphql";

export enum PreOrderStates {
  CREATED = "CREATED",
  PENDING_INFO = "PENDING_INFO",
  PENDING_LINE = "PENDING_LINE",
  VERIFIED = "VERIFIED",
  CLOSED = "CLOSED"
}

registerEnumType(PreOrderStates, {
  name: "PreOrderStates",
});
