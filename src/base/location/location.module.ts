import { Module } from "@nestjs/common";
import { CountryModule } from "./country/country.module";
import { ProvinceModule } from "./province/province.module";
import { CityModule } from "./city/city.module";
import { AreaModule } from "./area/area.module";

@Module({
  imports: [CountryModule, ProvinceModule, CityModule, AreaModule],
})
export class LocationModule {}
