import { registerEnumType } from "@nestjs/graphql";

export enum LegalStatusEnum {
    ACTIVE = 1,
    IN_ACTIVE = 0,
}

registerEnumType(LegalStatusEnum, { name: "ReferersEnum" });