import { registerEnumType } from "@nestjs/graphql";

export enum ExpireTypes {
  ONE_DAY = "ONE_DAY",
  TWO_DAYS = "TWO_DAYS",
  THREE_DAYS = "THREE_DAYS",
}

registerEnumType(ExpireTypes, { name: "ExpireTypes" });
