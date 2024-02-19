// favorite.module.ts

import { Module } from "@nestjs/common";
import { FavoriteResolver } from "./favorite.resolver";
import { FavoriteService } from "./favorite.service";

@Module({
  providers: [FavoriteService, FavoriteResolver],
})
export class FavoriteModule {}
