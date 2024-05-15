import { registerEnumType } from "@nestjs/graphql";

export enum PaymentMethodEnum {
  CACHE = "CACHE",
  CREADIT = "CREADIT",
}

registerEnumType(PaymentMethodEnum, { name: "PaymentMethodEnum" });
