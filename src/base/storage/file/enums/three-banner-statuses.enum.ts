import { registerEnumType } from "@nestjs/graphql";

export enum ThreeBannerStatuses {
  PENDING = "1",
  CONFIRMED = "2",
  REJECTED = "3"
 }

registerEnumType(ThreeBannerStatuses, {
  name: "ThreeBannerStatuses",
});
