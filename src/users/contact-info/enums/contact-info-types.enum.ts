import { registerEnumType } from "@nestjs/graphql";

export enum ContactInfoTypes {
  TEL = "tel",
  FAX = "fax",
  MOBILE = "mobile",
}

registerEnumType(ContactInfoTypes, {
  name: "ContactInfoTypes",
});
