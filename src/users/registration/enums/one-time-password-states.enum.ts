import { registerEnumType } from "@nestjs/graphql";

export enum OneTimePasswordStates {
  INIT = 1,
  VALIDATED = 2,
  USED = 3,
}

registerEnumType(OneTimePasswordStates, { name: "OneTimePasswordStates" });
