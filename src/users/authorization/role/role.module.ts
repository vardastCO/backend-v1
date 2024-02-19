import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { RoleResolver } from "./role.resolver";
import RoleSeeder from "./role.seed";
import { RoleService } from "./role.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleResolver, RoleService, RoleSeeder],
})
export class RoleModule {}
