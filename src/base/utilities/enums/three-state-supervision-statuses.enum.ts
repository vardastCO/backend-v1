import { registerEnumType } from "@nestjs/graphql";

export enum ThreeStateSupervisionStatuses {
  PENDING = "1",
  CONFIRMED = "2",
  REJECTED = "3",
}

registerEnumType(ThreeStateSupervisionStatuses, {
  name: "ThreeStateSupervisionStatuses",
});
