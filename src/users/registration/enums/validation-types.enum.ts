import { registerEnumType } from "@nestjs/graphql";
import { AuthStates } from "./auth-states.enum";
import { OneTimePasswordTypes } from "./one-time-password-types.enum";

export enum ValidationTypes {
  SIGNUP = "signup",
  LOGIN = "login",
  PASSWORD_RESET = "password_reset",
}
registerEnumType(ValidationTypes, { name: "ValidationTypes" });

export const validationTypeToOtpTypeMap = {
  [ValidationTypes.SIGNUP]: OneTimePasswordTypes.AUTH_SMS_OTP,
  [ValidationTypes.LOGIN]: OneTimePasswordTypes.AUTH_SMS_OTP,
  [ValidationTypes.PASSWORD_RESET]: OneTimePasswordTypes.PASS_RESET_SMS_OTP,
};

export const validationTypeToFinalStateResponseMap = {
  [ValidationTypes.SIGNUP]: {
    nextState: AuthStates.SIGNUP,
    message:
      "جهت ایجاد درخواست ثبت نام لطفا اطلاعات مورد نیاز را ارسال فرمایید.",
  },
  [ValidationTypes.PASSWORD_RESET]: {
    nextState: AuthStates.PASSWORD_RESET,
    message: "لطفا رمز عبور جدید حساب کاربری خود را انتخاب نمایید.",
  },
  [ValidationTypes.LOGIN]: {
    nextState: AuthStates.LOGIN,
    message: "ورود شما با موفقیت انجام شد منتظر بمانید .",
  },
};
