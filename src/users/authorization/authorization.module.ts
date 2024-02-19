import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthorizationGuard } from "./authorization.guard";
import { AuthorizationService } from "./authorization.service";
import { PermissionModule } from "./permission/permission.module";
import { RoleModule } from "./role/role.module";

@Global()
@Module({
  imports: [PermissionModule, RoleModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    AuthorizationService,
  ],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
