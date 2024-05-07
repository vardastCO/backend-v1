import { registerEnumType } from "@nestjs/graphql";

export enum EventTrackerTypes {
  VIEW_BUY_BOX = 1,
  VIEW_OFFER = 2,
  VIEW_NOTIFICATIONS = 3,
}

registerEnumType(EventTrackerTypes, { name: "EventTrackerTypes" });
