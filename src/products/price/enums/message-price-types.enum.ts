import { registerEnumType } from "@nestjs/graphql";

export enum MessagePriceTypesEnum {
  INFO = 1,
  SUCCESS = 2,
  ERROR = 3,
}

registerEnumType(MessagePriceTypesEnum, { name: "MessagePriceTypesEnum" });
