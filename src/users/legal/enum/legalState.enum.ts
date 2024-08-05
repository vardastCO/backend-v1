import { registerEnumType } from "@nestjs/graphql";

export enum LegalStateEnum {
    PENDING_OWNER = 0,
    PENDING_FINANTIAL = 1,
    PENDING_ADDRESS = 2,
    PENDING_CONTACT = 3,
    PENDING_MEMBER = 4,
    FULL = 5,
}

registerEnumType(LegalStateEnum, { name: "LegalStateEnum" });