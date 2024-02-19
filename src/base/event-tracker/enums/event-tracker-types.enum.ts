import { registerEnumType } from "@nestjs/graphql";

export enum EventTrackerTypes {
  VIEW_BUY_BOX = 1,
  VIEW_OFFER = 2,
}

registerEnumType(EventTrackerTypes, { name: "EventTrackerTypes" });
