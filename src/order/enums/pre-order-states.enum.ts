import { registerEnumType } from "@nestjs/graphql";

export enum PreOrderStatus {
  CREATED = "CREATED",
  PENDING_INFO = "PENDING_INFO",
  PENDING_LINE = "PENDING_LINE",
  VERIFIED = "VERIFIED",
  CLOSED = "CLOSED"
}

registerEnumType(PreOrderStatus, {
  name: "PreOrderStates",
});
