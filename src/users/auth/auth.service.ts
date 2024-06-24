import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { verify } from "argon2";
import { Country } from "src/base/location/country/entities/country.entity";
import { IsNull, MoreThanOrEqual } from "typeorm";
import { Role } from "../authorization/role/entities/role.entity";
import { OneTimePassword } from "../registration/entities/one-time-password.entity";
import { OneTimePasswordStates } from "../registration/enums/one-time-password-states.enum";
import { OneTimePasswordTypes } from "../registration/enums/one-time-password-types.enum";
import { Session } from "../sessions/entities/session.entity";
import { DeletionReasons } from "../sessions/enums/deletion-reasons.enum";
import { User } from "../user/entities/user.entity";
import { UserLanguagesEnum } from "../user/enums/user-languages.enum";
import { UserStatusesEnum } from "../user/enums/user-statuses.enum";
import { UserService } from "../user/user.service";
import { ChangeNumberInput } from "./dto/change-number.input";
import { LoginOTPInput } from "./dto/login-otp.input";
import { LoginResponse } from "./dto/login.response";
import { LogoutResponse } from "./dto/logout.response";
import { RefreshInput } from "./dto/refresh.input";
import { RefreshResponse } from "./dto/refresh.response";
import { UserType } from "./enums/type-user.enum";
import { Legal } from "../legal/entities/legal.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user: User = await this.userService.findOneBy({ username });

    if (user && (await verify(user.password, password))) {
      delete user.password;
      return user;
    }

    return null;
  }
  async loginOTP(
    LoginOTPInput: LoginOTPInput,
    requestIP: string,
    agent: string,
  ): Promise<LoginResponse> {
    const now = new Date();
    now.setSeconds(
      now.getSeconds() -
      OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
    );
    const lastRecentValidatedOtp = await OneTimePassword.createQueryBuilder()
      .where({
        id: LoginOTPInput.validationKey,
        state: OneTimePasswordStates.VALIDATED,
        type: OneTimePasswordTypes.AUTH_SMS_OTP,
        requesterIp: requestIP,
        validatedAt: MoreThanOrEqual(now),
      })
      .orderBy({ '"createdAt"': "DESC" })
      .getOne();
    
    // console.log('last',lastRecentValidatedOtp)
  
    if (!lastRecentValidatedOtp) {
      throw new BadRequestException(
        "token is not expired yet or is invalid altogether.",
      );
    }
  
    const user: User = await User.findOneBy({ cellphone: LoginOTPInput.cellphone });
  
    if (user) {
      const userWholePermissions = await this.userService.cachePermissionsOf(
        user,
      );
  
      let session = await Session.findOneBy({ userId: user.id });

      if (!session) {
        // If no session exists, create a new one
        session = Session.create({
          userId: user.id,
          agent,
          loginIp: requestIP,
        });
      
        await session.save();
      }

      // console.log('past user',[{
      //   accessToken: this._generateNewAccessToken(user, session),
      //   accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      //   refreshToken: this._generateNewRefreshToken(user, session),
      //   refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      //   user,
      //   abilities: userWholePermissions,
      // }])
  
      return {
        accessToken: this._generateNewAccessToken(user, session,LoginOTPInput.type),
        accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
        refreshToken: this._generateNewRefreshToken(user, session,LoginOTPInput.type),
        refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        user,
        type: LoginOTPInput.type,
        legal : null,
        abilities: userWholePermissions,
      };
    }
  
    lastRecentValidatedOtp.state = OneTimePasswordStates.USED;
  
    const iran = await Country.findOneBy({ alphaTwo: "IR" });
    const userRole = await Role.findOneBy({ name: "user" });
    let newUser: User = User.create({
      cellphone: lastRecentValidatedOtp.receiver,
      isCellphoneVerified: true,
      username: lastRecentValidatedOtp.receiver,
      language: UserLanguagesEnum.FARSI,
      timezone: "Asia/Terhan",
      status: UserStatusesEnum.ACTIVE,
      countryId: iran.id,
      lastLoginAt: new Date(),
      lastLoginIP: requestIP,
      displayRoleId: userRole.id,
    });
    newUser.roles = Promise.resolve([userRole]);
  
    await newUser.save();
    await lastRecentValidatedOtp.save();
    const userWholePermissions = await this.userService.cachePermissionsOf(
      newUser,
    );

    console.log('new user')
  
    // await User.update(
    //   { id: newUser.id },
    //   {
    //     lastLoginAt: () => "CURRENT_TIMESTAMP",
    //     lastLoginIP: requestIP,
    //   },
    // );
    let session = Session.create({
      userId: newUser.id,
      agent,
      loginIp: requestIP,
    });
    await session.save();

    return {
      accessToken: this._generateNewAccessToken(newUser, session,LoginOTPInput.type),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(newUser, session,LoginOTPInput.type),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      user: newUser,
      type: LoginOTPInput.type,
      legal : null,
      abilities: userWholePermissions,
    };
  }
  async changeNumberWithOtp(
    changeNumberInput: ChangeNumberInput,
    requestIP: string,
    agent: string,
  ): Promise<LoginResponse> {
    const now = new Date();
    now.setSeconds(
      now.getSeconds() -
      OneTimePassword.SIGNUP_DEADLINE_AFTER_VALIDATION_SECONDS,
    );
    const lastRecentValidatedOtp = await OneTimePassword.createQueryBuilder()
      .where({
        id: changeNumberInput.validationKey,
        state: OneTimePasswordStates.VALIDATED,
        type: OneTimePasswordTypes.AUTH_SMS_OTP,
        requesterIp: requestIP,
        validatedAt: MoreThanOrEqual(now),
      })
      .orderBy({ '"createdAt"': "DESC" })
      .getOne();
    
  
    if (!lastRecentValidatedOtp) {
      throw new BadRequestException(
        "token is not expired yet or is invalid altogether.",
      );
    }
  
    const user: User = await User.findOneBy({ cellphone: changeNumberInput.cellphone });
    if (!user) {
      throw new BadRequestException(
        "user is not found yet or is invalid altogether.",
      );
    }
    user.cellphone = changeNumberInput.cellphone_new
    await user.save()
    const userWholePermissions = await this.userService.cachePermissionsOf(
      user,
    );

    let session = await Session.findOneBy({ userId: user.id });

    if (!session) {
      session = Session.create({
        userId: user.id,
        agent,
        loginIp: requestIP,
      });
    
      await session.save();
    }

    return {
      accessToken: this._generateNewAccessToken(user, session,changeNumberInput.type),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(user, session,changeNumberInput.type),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      user,
      type:changeNumberInput.type,
      legal : null,
      abilities: userWholePermissions,
    };
    
  
  }

  async login(
    type: UserType,
    user: User,
    requestIP: string,
    agent: string,
  ): Promise<LoginResponse> {
    // get a list of roles and cache it
    await this.userService.cacheRolesOf(user);

    // get a list of all permissions and cache it
    const userWholePermissions = await this.userService.cachePermissionsOf(
      user,
    );

    // Update user entity
    await User.update(
      { id: user.id },
      {
        lastLoginAt: () => "CURRENT_TIMESTAMP",
        lastLoginIP: requestIP,
      },
    );

    const session = Session.create({
      userId: user.id,
      agent,
      loginIp: requestIP,
    });
    await session.save();

    delete user.password;
    return {
      accessToken: this._generateNewAccessToken(user, session,type),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(user, session,type),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      user,
      type: type,
      legal : null,
      abilities: userWholePermissions,
    };
  }

  async refresh(
    refreshInput: RefreshInput,
    user: User,
  ): Promise<RefreshResponse> {
    const { accessToken, refreshToken } = refreshInput;
    let accessTokenPayload, refreshTokenPayload;
    // accessToken should be valid but expired
    try {
      accessTokenPayload = this.jwtService.verify(accessToken, {
        ignoreExpiration: true,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(
        "Access token is not expired yet or is invalid altogether.",
      );
    }

    try {
      refreshTokenPayload = this.jwtService.verify(refreshToken, {
        // maxAge: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        secret: this.configService.get("AUTH_JWT_REFRESH_SECRET"),
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException("Refresh token is not valid.");
    }

    if (
      !accessTokenPayload.hasOwnProperty("uuid") ||
      !refreshTokenPayload.hasOwnProperty("uuid") ||
      !accessTokenPayload.hasOwnProperty("sid") ||
      !refreshTokenPayload.hasOwnProperty("sid") ||
      (user && accessTokenPayload.uuid != user.uuid) ||
      accessTokenPayload.uuid != refreshTokenPayload.uuid ||
      accessTokenPayload.sid != refreshTokenPayload.sid
    ) {
      throw new BadRequestException("Tokens payload cross integrity problem.");
    }

    if (!user) {
      user = await User.findOneBy({ uuid: accessTokenPayload.uuid });
    }

    const session = await Session.findOneBy({
      id: refreshTokenPayload.sid,
      userId: user.id,
      deletedAt: IsNull(),
      deletionReason: IsNull(),
    });

    if (!session) {
      throw new BadRequestException(
        "Invalid session data, unable to issue new tokens.",
      );
    }

    // get a list of roles and cache it
    await this.userService.cacheRolesOf(user);

    // get a list of all permissions and cache it
    const userWholePermissions = await this.userService.cachePermissionsOf(
      user,
    );
    delete user.password;

    return {
      accessToken: this._generateNewAccessToken(user, session,refreshInput.type),
      accessTokenTtl: this.configService.get<number>("AUTH_JWT_ACCESS_TTL"),
      refreshToken: this._generateNewRefreshToken(user, session,refreshInput.type),
      refreshTokenTtl: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
      user,
      type: refreshInput.type,
      legal : null,
      abilities: userWholePermissions,
    };
  }

  async logout(
    user: User,
    requestIP: string,
    accessToken: string,
  ): Promise<LogoutResponse> {
  
    const accessTokenPayload = this.jwtService.decode(accessToken);
    await Session.update(
      { id: accessTokenPayload["sid"], deletedAt: IsNull() },
      {
        deletedAt: () => "CURRENT_TIMESTAMP",
        deletionReason: DeletionReasons.LOGOUT,
      },
    );
    console.log(
      `us${user.id}er logged out with ip: ${requestIP} and accessToken: ${accessToken}.`,
    );
    return { user };
  }

  private _generateNewAccessToken(user: User, session: Session,type:UserType): string {
    return this.jwtService.sign({
      uuid: user.uuid,
      sid: session.id,
      type:type
    });
  }

  private _generateNewRefreshToken(user: User, session: Session,type:UserType): string {
    return this.jwtService.sign(
      {
        uuid: user.uuid,
        sid: session.id,
        type:type
      },
      {
        expiresIn: this.configService.get<number>("AUTH_JWT_REFRESH_TTL"),
        secret: this.configService.get("AUTH_JWT_REFRESH_SECRET"),
      },
    );
  }

  async whoAmI(user: User, isRealUserType: boolean): Promise<User> {

    user.legal = null
    const legalData = await Legal.findOneBy({
      ownerId: user.id
    });
    user.legal = legalData ?? null; 
  
    return user;
  }
  
}
