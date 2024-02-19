import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AreaResolver } from "./area.resolver";
import AreaSeeder from "./area.seed";
import { AreaService } from "./area.service";
import { Area } from "./entities/area.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  providers: [AreaResolver, AreaService, AreaSeeder],
  exports: [AreaService],
})
export class AreaModule {}
