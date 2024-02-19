import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CityModule } from "../city/city.module";
import { Province } from "./entities/province.entity";
import { ProvinceResolver } from "./province.resolver";
import ProvinceSeeder from "./province.seed";
import { ProvinceService } from "./province.service";

@Module({
  imports: [TypeOrmModule.forFeature([Province]), CityModule],
  providers: [ProvinceResolver, ProvinceService, ProvinceSeeder],
  exports: [ProvinceService],
})
export class ProvinceModule {}
