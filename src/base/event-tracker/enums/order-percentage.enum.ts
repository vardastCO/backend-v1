import { registerEnumType } from "@nestjs/graphql";

export enum OrderPercentageTypes {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  YEARLY = 4,
}

registerEnumType(OrderPercentageTypes, { name: "OrderPercentageTypes" });
