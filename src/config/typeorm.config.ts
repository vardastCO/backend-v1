import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: "postgres",
      host: configService.get("DB_HOST", "localhost"),
      port: parseInt(configService.get("DB_PORT", "5432")),
      username: configService.get("DB_USERNAME", ""),
      password: configService.get("DB_PASSWORD", ""),
      database: configService.get("DB_NAME", "sazmate"),
      synchronize: configService.get("DB_SYNC", "false") === "true",
      logging: configService.get("DB_QUERY_LOG", "false") === "true",
      entities: [__dirname + "/../**/*.entity.{ts,js}"],
    };
  },
};
