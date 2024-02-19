import { registerEnumType } from "@nestjs/graphql";

export enum AuthStates {
  VALIDATE_CELLPHONE = "validate_cellphone",
  VALIDATE_OTP = "validate_otp",
  SIGNUP = "signup",
  LOGIN = "login",
  ENTER = "enter",
  LOGGED_IN = "logged_in",
  PASSWORD_RESET = "password_reset",
}

registerEnumType(AuthStates, { name: "AuthStates" });
