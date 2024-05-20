import { registerEnumType } from "@nestjs/graphql";

export enum PaymentMethodEnum {
  CASH = "CASH",
  CREDIT = "CREDIT",
}

registerEnumType(PaymentMethodEnum, { name: "PaymentMethodEnum" });
