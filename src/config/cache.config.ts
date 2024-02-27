import { CacheModuleAsyncOptions, CacheModuleOptions, CacheStore } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";

export const cacheAsyncConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<CacheModuleOptions> => ({
    store: redisStore as unknown as CacheStore,
    urls: [
      `redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT_1")}`,
      `redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT_2")}`,
      `redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT_3")}`,
      `redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT_4")}`,
      `redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT_5")}`,
    ],
    ttl: CacheTTL.ONE_WEEK,
    max: 20, 
    min: 1, 
  }),
};
