import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModuleAsyncOptions, JwtModuleOptions } from "@nestjs/jwt";

export const jwtAsyncConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<JwtModuleOptions> => ({
    secret: configService.get<string>("AUTH_JWT_ACCESS_SECRET"),
    signOptions: {
      expiresIn: configService.get<number>("AUTH_JWT_ACCESS_TTL"),
    },
  }),
};
