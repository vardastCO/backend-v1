import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "src/users/auth/decorators/public.decorator";

@Controller("app/version")
export class AppFileController {
  @Public()
  @Get()
  async getVersion(@Res() res: Response) {
    // Retrieve the version from the environment variable
    const appVersion = process.env.APP_VERSION || "1.0.0";
    res.send(appVersion);
  }
}
