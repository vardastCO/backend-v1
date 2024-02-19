import { registerEnumType } from "@nestjs/graphql";

export enum ChartEnum {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

registerEnumType(ChartEnum, { name: "ChartEnum" });
