import { registerEnumType } from "@nestjs/graphql";

export enum MessagePriceTypesEnum {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

registerEnumType(MessagePriceTypesEnum, { name: "MessagePriceTypesEnum" });
