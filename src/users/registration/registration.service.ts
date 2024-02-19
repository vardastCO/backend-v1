import { BadRequestException, Injectable } from "@nestjs/common";
import { hash } from "argon2";
import { KavenegarService } from "src/base/kavenegar/kavenegar.service";
import { Country } from "src/base/location/country/entities/country.entity";
import { IsNull, MoreThanOrEqual } from "typeorm";
import { Role } from "../authorization/role/entities/role.entity";
import { User } from "../user/entities/user.entity";
import { UserLanguagesEnum } from "../user/enums/user-languages.enum";
import { UserStatusesEnum } from "../user/enums/user-statuses.enum";
import { SignupInput } from "./dto/signup.input";
import { SignupResponse } from "./dto/signup.response";
import { ValidateCellphoneInput } from "./dto/validate-cellphone.input";
import { ValidateCellphoneResponse } from "./dto/validate-cellphone.response";
import { ValidateOtpInput } from "./dto/validate-otp.input";
import { ValidateOtpResponse } from "./dto/validate-otp.response";
import { LoginResponse } from "../auth/dto/login.response";
import { OneTimePassword } from "./entities/one-time-password.entity";
import { AuthStates } from "./enums/auth-states.enum";
import { OneTimePasswordStates } from "./enums/one-time-password-states.enum";
import { OneTimePasswordTypes } from "./enums/one-time-password-types.enum";
import {
  ValidationTypes,
  validationTypeToFinalStateResponseMap,
  validationTypeToOtpTypeMap,
} from "./enums/validation-types.enum";

@Injectable()
export class RegistrationService {
  constructor(private readonly kavenegarService: KavenegarService) {}

  async validateCellphone(
    validateCellphoneInput: ValidateCellphoneInput,
    ipAddress: string,
  ): Promise<ValidateCellphoneResponse> {
    console.log('hiiiiiiiiiiiiiiiiii')
    await validateCellphoneInput.validateAndFormatCellphone();
    validateCellphoneInput.validationType =
      validateCellphoneInput.validationType ?? ValidationTypes.SIGNUP;

    // check to see if user exists:
    const userExists = await User.createQueryBuilder()
      .where({ cellphone: validateCellphoneInput.cellphone })
      .getExists();

    if (
      validateCellphoneInput.validationType == ValidationTypes.SIGNUP &&
      userExists
    ) {
      return {
        nextState: AuthStates.LOGIN,
        message: "لطفا وارد حساب کاربری خود شوید.",
      };
    } else if (
      validateCellphoneInput.validationType == ValidationTypes.PASSWORD_RESET &&
      !userExists
    ) {
      return {
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message: "کاربری با این مشخصات یافت نشد.",
      };
    }

    // check to see if any valid otp exists
    const now = new Date();
    now.setSeconds(
      now.getSeconds() - OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS,
    );
    let lastUnexpiredOtp = await OneTimePassword.createQueryBuilder()
      .where({
        requesterIp: ipAddress,
        type: validationTypeToOtpTypeMap[validateCellphoneInput.validationType],
        receiver: validateCellphoneInput.cellphone,
        validatedAt: IsNull(),
        state: OneTimePasswordStates.INIT,
        createdAt: MoreThanOrEqual(now),
      })
      .orderBy({ '"createdAt"': "DESC" })
      .getOne();

    let isNewTokenSend: boolean;
    if ((isNewTokenSend = !lastUnexpiredOtp)) {
      lastUnexpiredOtp = OneTimePassword.create({
        requesterIp: ipAddress,
        type: validationTypeToOtpTypeMap[validateCellphoneInput.validationType],
        receiver: validateCellphoneInput.cellphone,
      }).generateNewToken();
      console.log('aaa',lastUnexpiredOtp.receiver,lastUnexpiredOtp.token)
      await this.kavenegarService.lookup(
        lastUnexpiredOtp.receiver,
        "verify",
        lastUnexpiredOtp.token,
      );

      await (await lastUnexpiredOtp.hashTheToken()).save();
    }

    const secondsPastFromOtpGeneration = Math.round(
      (new Date().getTime() - lastUnexpiredOtp.createdAt.getTime()) / 1000,
    );

    return {
      validationKey: lastUnexpiredOtp.id,
      remainingSeconds:
        OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS -
        secondsPastFromOtpGeneration,
      nextState: AuthStates.VALIDATE_OTP,
      message: isNewTokenSend
        ? `رمز یکبار مصرف به شماره ${lastUnexpiredOtp.receiver} پیامک شد.`
        : `رمز یکبار مصرف قبلا به شماره ${lastUnexpiredOtp.receiver} پیامک شده است.`,
    };
  }

  async validateOtp(
    validateOtpInput: ValidateOtpInput,
    ipAddress: string,
  ): Promise<ValidateOtpResponse> {
    validateOtpInput.validationType =
      validateOtpInput.validationType ?? ValidationTypes.SIGNUP;
    const now = new Date();
    now.setSeconds(
      now.getSeconds() - OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS,
    );
    // check to see if any valid otp exists
    const lastUnexpiredOtp = await OneTimePassword.createQueryBuilder()
      .where({
        id: validateOtpInput.validationKey,
        requesterIp: ipAddress,
        type: validationTypeToOtpTypeMap[validateOtpInput.validationType],
        validatedAt: IsNull(),
        state: OneTimePasswordStates.INIT,
        createdAt: MoreThanOrEqual(now),
      })
      .getOne();

    if (!lastUnexpiredOtp) {
      return {
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message:
          "رمز یکبار مصرف منقضی شده است. لطفا فرآیند را از ابتدا شروع نمایید.",
      };
    }

    console.log('ggggg')

    if (!(await lastUnexpiredOtp.doesTokenMatches(validateOtpInput.token))) {
      console.log('uuuuuuuuuuuuuu')
      throw new BadRequestException("رمز یکبار مصرف وارد شده اشتباه است.");
    }

    lastUnexpiredOtp.validatedAt = new Date();
    lastUnexpiredOtp.state = OneTimePasswordStates.VALIDATED;
    await lastUnexpiredOtp.save();

    // Check to see if any users exists, if so fail with error
    const anyUsersExists = await User.createQueryBuilder()
      .where({ cellphone: lastUnexpiredOtp.receiver })
      .getExists();
    if (
      validateOtpInput.validationType == ValidationTypes.SIGNUP &&
      anyUsersExists
    ) {
      console.log('start',validateOtpInput.validationType,anyUsersExists)
      return {
        nextState: AuthStates.LOGIN,
        message: "لطفا وارد حساب کاربری خود شوید.",
      };
    } else if (
      validateOtpInput.validationType == ValidationTypes.PASSWORD_RESET &&
      !anyUsersExists
    ) {
      console.log('start46456456')
      return {
        
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message: "خطایی در فرآیند رخ داده، لطفا فرآیند را از ابتدا شروع کنید.",
      };
    }

    console.log('end',validateOtpInput.validationKey)

    return {
      validationKey: validateOtpInput.validationKey,
      ...validationTypeToFinalStateResponseMap[validateOtpInput.validationType],
    };
  }

  async signup(
    signupInput: SignupInput,
    ipAddress: string,
  ): Promise<SignupResponse> {
    // Check to see if any valid otp exists
    const now = new Date();
    now.setSeconds(
      now.getSeconds() -
        OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
    );
    const lastRecentValidatedOtp = await OneTimePassword.createQueryBuilder()
      .where({
        id: signupInput.validationKey,
        state: OneTimePasswordStates.VALIDATED,
        type: OneTimePasswordTypes.AUTH_SMS_OTP,
        requesterIp: ipAddress,
        validatedAt: MoreThanOrEqual(now),
      })
      .orderBy({ '"createdAt"': "DESC" })
      .getOne();

    if (!lastRecentValidatedOtp) {
      return {
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message:
          "اطلاعات نمونه فرآیند ثبت نام یافت نشد. لطفا فرآیند را از ابتدا شروع نمایید.",
      };
    }

    const userExists = await User.createQueryBuilder()
      .where({
        cellphone: lastRecentValidatedOtp.receiver,
      })
      .getExists();
    if (userExists) {
      return {
        nextState: AuthStates.LOGIN,
        message: "ثبت نام قبلا انجام شده است. لطفا از تلاش مجدد پرهیز کنید.",
      };
    }

    lastRecentValidatedOtp.state = OneTimePasswordStates.USED;

    const iran = await Country.findOneBy({ alphaTwo: "IR" });
    const userRole = await Role.findOneBy({ name : "user"});
    const user = User.create({
      firstName: signupInput.firstName,
      lastName: signupInput.lastName,
      email: signupInput.email,
      cellphone: lastRecentValidatedOtp.receiver,
      isCellphoneVerified: true,
      username: lastRecentValidatedOtp.receiver,
      password: await hash(signupInput.password),
      language: signupInput.language ?? UserLanguagesEnum.FARSI,
      timezone: signupInput.timezone ?? "Asia/Terhan",
      status: UserStatusesEnum.ACTIVE,
      countryId: iran.id,
      displayRoleId: userRole.id,
    });
    user.roles = Promise.resolve([userRole]);

    await user.save();
    await lastRecentValidatedOtp.save();
    // await this.kavenegarService.lookup(user.cellphone, "postSignup", "کاربر");

    return {
      nextState: AuthStates.LOGIN,
      message:
        "حساب کاربری شما با موفقیت ایجاد شد و پس از تایید کارشناسان وردست فعال می‌شود." +
        "فعال سازی حساب کاربریتان از طریق پیام کوتاه به شما اطلاع رسانی خواهد شد.",
    };
  }
}
