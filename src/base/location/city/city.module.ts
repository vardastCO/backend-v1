import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AreaModule } from "../area/area.module";
import { CityResolver } from "./city.resolver";
import CitySeeder from "./city.seed";
import { CityService } from "./city.service";
import { City } from "./entities/city.entity";

@Module({
  imports: [TypeOrmModule.forFeature([City]), AreaModule],
  providers: [CityResolver, CityService, CitySeeder],
  exports: [CityService],
})
export class CityModule {}
