import { registerEnumType } from "@nestjs/graphql";

export enum EventTrackerSubjectTypes {
  CONTACT_INFO = "ContactInfo",
  ADDRESS = "Address",
}

registerEnumType(EventTrackerSubjectTypes, {
  name: "EventTrackerSubjectTypes",
});
