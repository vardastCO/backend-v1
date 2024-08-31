// src/options/options.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OptionsService } from "./options.service";
import { OptionsResolver } from "./options.resolver";
import { Option } from "./entities/option.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Option])],
  providers: [OptionsService, OptionsResolver],
})
export class OptionsModule {}
