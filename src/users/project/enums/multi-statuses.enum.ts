import { registerEnumType } from "@nestjs/graphql";

export enum MultiStatuses {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
 }

registerEnumType(MultiStatuses, {
  name: "MultiStatuses",
});
