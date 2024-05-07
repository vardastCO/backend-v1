import { registerEnumType } from "@nestjs/graphql";

export enum EventTrackerSubjectTypes {
  CONTACT_INFO = "ContactInfo",
  ADDRESS = "Address",
  NOTIFICATION = "NOTIFICATION",
}

registerEnumType(EventTrackerSubjectTypes, {
  name: "EventTrackerSubjectTypes",
});
