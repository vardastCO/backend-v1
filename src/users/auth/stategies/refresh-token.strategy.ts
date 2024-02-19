import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: configService.get<string>("AUTH_JWT_REFRESH_SECRET"),
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.get("Authorization").replace("Bearer", "").trim();
    return { ...payload, refreshToken };
  }
}
