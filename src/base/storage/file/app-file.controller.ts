import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";

@Controller("app/version")
export class AppFileController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Public()
  @Get()
  async getVersion(@Res() res: Response) {
    const cacheKey = `app_version`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);

    if (cachedData) {
      return res.send(cachedData); // Return immediately after sending the cached data
    }

    const appVersion = process.env.APP_VERSION || "1.0.0";
    await this.cacheManager.set(cacheKey, appVersion, CacheTTL.ONE_DAY);
    return res.send(appVersion); // Send the version and return
  }
}
