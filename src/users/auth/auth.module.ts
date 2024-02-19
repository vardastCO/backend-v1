import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { jwtAsyncConfig } from "./config/jwt.config";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AccessTokenStrategy } from "./stategies/access-token.strategy";
import { LocalStrategy } from "./stategies/local.strategy";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync(jwtAsyncConfig),
    UserModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    LocalStrategy,
    AccessTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
