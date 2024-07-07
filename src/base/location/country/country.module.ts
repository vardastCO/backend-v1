import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProvinceModule } from "../province/province.module";
import { CountryResolver } from "./country.resolver";
import CountrySeeder from "./country.seed";
import { CountryService } from "./country.service";
import { Country } from "./entities/country.entity";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  imports: [TypeOrmModule.forFeature([Country]), ProvinceModule],
  providers: [CountryResolver, CountryService, CountrySeeder,CompressionService,DecompressionService],
  exports: [CountryService],
})
export class CountryModule {}
