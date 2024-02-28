import {
  CacheModuleAsyncOptions,
  CacheModuleOptions,
  CacheStore,
} from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as memoryStore from "cache-manager-memory-store"; 
import { CacheTTL } from "src/base/utilities/cache-ttl.util";

export const cacheAsyncConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<CacheModuleOptions> => ({
    store: memoryStore as unknown as CacheStore,
    url: `redis://${configService.get("REDIS_HOST")}:${configService.get(
      "REDIS_PORT",
    )}`,
    ttl: CacheTTL.ONE_WEEK,
    max: 20, // Adjust the connection pool size as needed
    min: 1,  // Minimum number of connections in the pool
  }),
};
