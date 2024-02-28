import {
  CacheModuleAsyncOptions,
  CacheModuleOptions,
  CacheStore,
} from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MemoryStore } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";

export const cacheAsyncConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<CacheModuleOptions> => ({
    store: MemoryStore ,
    url: `redis://${configService.get("REDIS_HOST")}:${configService.get(
      "REDIS_PORT",
    )}`,
    ttl: CacheTTL.ONE_WEEK,
    max: 30, // Adjust based on performance testing
    min: 5,  // Minimum number of connections in the pool
  }),
};
