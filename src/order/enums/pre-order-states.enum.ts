import { registerEnumType } from "@nestjs/graphql";

export enum PreOrderStatus {
  PENDING_INFO = "PENDING_INFO",
  PENDING_PRODUCT = "PENDING_PRODUCT",
  PENDING_ADMIN = "PENDING_ADMIN",
  VERIFY_FILE = "VERIFY_FILE",
  PENDING_OFFER = "PENDING_OFFER",
  COMPLITED = "COMPLITED",
  CLOSED = "CLOSED",
}

registerEnumType(PreOrderStatus, {
  name: "PreOrderStates",
});
