import { registerEnumType } from "@nestjs/graphql";

export enum OneTimePasswordTypes {
  AUTH_SMS_OTP = "auth_sms_otp",
  PASS_RESET_SMS_OTP = "pass_reset_sms_otp",
}

registerEnumType(OneTimePasswordTypes, { name: "OneTimePasswordTypes" });
