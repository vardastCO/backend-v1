import { registerEnumType } from "@nestjs/graphql";
//
export enum OrderOfferStatuses {
  PENDING_PRICE = "PENDING_PRICE",
  INVOICE = "INVOICE",
  PAYMENT_SUBMITED = "PAYMENT_SUBMITED",
  CLOSED = "CLOSED",
 }

registerEnumType(OrderOfferStatuses, {
  name: "OrderOfferStatuses",
});
