import { registerEnumType } from "@nestjs/graphql";

export enum UserStatusesEnum {
  BANNED = -1,
  NOT_ACTIVATED = 0,
  ACTIVE = 1,
}

registerEnumType(UserStatusesEnum, { name: "UserStatusesEnum" });
