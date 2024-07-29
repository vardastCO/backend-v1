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
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  ValidationTypes,
  validationTypeToFinalStateResponseMap,
  validationTypeToOtpTypeMap,
} from "./enums/validation-types.enum";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Blacklist } from "./entities/blacklist.entity";

@Injectable()
export class RegistrationService {
  constructor(private readonly kavenegarService: KavenegarService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async validateCellphone(
    validateCellphoneInput: ValidateCellphoneInput,
    ipAddress: string,
  ): Promise<ValidateCellphoneResponse> {
  
    await validateCellphoneInput.validateAndFormatCellphone();
    validateCellphoneInput.validationType =
      validateCellphoneInput.validationType ?? ValidationTypes.SIGNUP;
    
    const blacklist = await this.loadBlacklistIntoCacheIfNotExists();
    if (blacklist.has(validateCellphoneInput.cellphone)) {
      throw new Error('Cellphone number is blacklisted');
    }
    
  
    const now = new Date();
    now.setSeconds(now.getSeconds() - OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS);
  
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
  
    let isNewTokenSend: boolean = !lastUnexpiredOtp;
  
    if (isNewTokenSend) {
      lastUnexpiredOtp = OneTimePassword.create({
        requesterIp: ipAddress,
        type: validationTypeToOtpTypeMap[validateCellphoneInput.validationType],
        receiver: validateCellphoneInput.cellphone,
      }).generateNewToken();
  
      // const key = `kavenegar:${validateCellphoneInput.cellphone}:${lastUnexpiredOtp.token}`;
      // await this.cacheManager.set(key, 'OTP', CacheTTL.TEN_SECONDS);
      
      await this.kavenegarService.lookup(
        validateCellphoneInput.cellphone,
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
        OneTimePassword.SMS_OTP_EXPIRES_IN_SECONDS - secondsPastFromOtpGeneration,
      nextState: AuthStates.VALIDATE_OTP,
      message: isNewTokenSend
        ? `رمز یکبار مصرف به شماره ${lastUnexpiredOtp.receiver} پیامک شد.`
        : `رمز یکبار مصرف قبلا به شماره ${lastUnexpiredOtp.receiver} پیامک شده است.`,
    };
  }
  async  loadBlacklistIntoCacheIfNotExists(): Promise<Set<string>> {
    const blacklistKey = 'blacklist:all';
    let blacklist = await this.cacheManager.get<string[]>(blacklistKey);
  
    if (!blacklist) {
      const blacklistEntries = await Blacklist.find();
      blacklist = blacklistEntries.map(entry => entry.cellphone);
      await this.cacheManager.set(blacklistKey, blacklist, CacheTTL.TWO_WEEK);
    }
  
    return new Set(blacklist);
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

    console.log('validate otp;',lastUnexpiredOtp.receiver,validateOtpInput.token)

    if (!(await lastUnexpiredOtp.doesTokenMatches(validateOtpInput.token))) {
      console.log('wrong password')
      throw new BadRequestException("رمز یکبار مصرف وارد شده اشتباه است.");
    }

    lastUnexpiredOtp.validatedAt = new Date();
    lastUnexpiredOtp.state = OneTimePasswordStates.VALIDATED;
    await lastUnexpiredOtp.save();

    const anyUsersExists = await User.createQueryBuilder()
      .where({ cellphone: lastUnexpiredOtp.receiver })
      .getExists();
    if (
      validateOtpInput.validationType == ValidationTypes.SIGNUP &&
      anyUsersExists
    ) {
      return {
        nextState: AuthStates.LOGIN,
        message: "لطفا وارد حساب کاربری خود شوید.",
      };
    } else if (
      validateOtpInput.validationType == ValidationTypes.PASSWORD_RESET &&
      !anyUsersExists
    ) {
      return {
        
        nextState: AuthStates.VALIDATE_CELLPHONE,
        message: "خطایی در فرآیند رخ داده، لطفا فرآیند را از ابتدا شروع کنید.",
      };
    }

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
