import { registerEnumType } from "@nestjs/graphql";

export enum LegalStatusEnum {
  ACTIVE = 1,
  DEACTIVE = 0,
}

registerEnumType(LegalStatusEnum, { name: "LegalStatusEnum" });
