import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./entities/permission.entity";
import { PermissionResolver } from "./permission.resolver";
import { PermissionService } from "./permission.service";
import PermissionSeeder from "./permission.seed";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionResolver, PermissionService, PermissionSeeder],
})
export class PermissionModule {}
