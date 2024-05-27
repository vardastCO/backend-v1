import { registerEnumType } from "@nestjs/graphql";

export enum OrderOfferStatuses {
  PENDING = "1",
  CONFIRMED = "2",
  REJECTED = "3",
  VERIFIED = "4",
  CLOSED = "5"
 }

registerEnumType(OrderOfferStatuses, {
  name: "OrderOfferStatuses",
});
