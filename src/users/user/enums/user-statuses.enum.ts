import { registerEnumType } from "@nestjs/graphql";

export enum UserStatusesEnum {
  BANNED = -1,
  NOT_ACTIVATED = 2,
  ACTIVE = 1,
}

registerEnumType(UserStatusesEnum, { name: "UserStatusesEnum" });
