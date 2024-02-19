import { registerEnumType } from "@nestjs/graphql";

export enum AttributeTypesEnum {
  TEXT = "text",
  TEXTAREA = "textarea",
  SELECT = "select",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  // IMAGE = "image",
  // FILE = "file",
  NUMBER = "number",
  CURRENCY = "currency",
}

registerEnumType(AttributeTypesEnum, { name: "AttributeTypesEnum" });
