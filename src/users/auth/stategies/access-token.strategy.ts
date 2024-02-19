import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../../user/entities/user.entity";
import { UserStatusesEnum } from "../../user/enums/user-statuses.enum";
import { UserService } from "../../user/user.service";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("AUTH_JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await User.createQueryBuilder()
      .where({ uuid: payload.uuid })
      .andWhere(
        'exists (select 1 from user_sessions where "userId" = "User".id and id = :sid and "deletedAt" is null and "deletionReason" is null)',
        { sid: payload.sid },
      )
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Unable to resolve user entity.");
    }

    if (user.status == UserStatusesEnum.NOT_ACTIVATED) {
      throw new BadRequestException(
        "حساب کاربری شما فعال نیست. لطفا منتظر فعال سازی حساب کاربری خود از سوی کارشناسان وردست باشید.",
      );
    }

    if (user.status == UserStatusesEnum.BANNED) {
      throw new BadRequestException(
        "حساب کاربری شما تعلیق شده است. علت: " + user.suspensionReason,
      );
    }

    return user;
  }
}
