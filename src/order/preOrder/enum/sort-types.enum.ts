import { registerEnumType } from "@nestjs/graphql";

export enum PaymentMethodEnum {
  CASH = "CASH",
  CREADIT = "CREADIT",
}

registerEnumType(PaymentMethodEnum, { name: "PaymentMethodEnum" });
