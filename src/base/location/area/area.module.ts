import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AreaResolver } from "./area.resolver";
import AreaSeeder from "./area.seed";
import { AreaService } from "./area.service";
import { Area } from "./entities/area.entity";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  providers: [AreaResolver, AreaService, AreaSeeder,CompressionService,DecompressionService],
  exports: [AreaService],
})
export class AreaModule {}
