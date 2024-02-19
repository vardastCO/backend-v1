import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Cache } from "cache-manager";
import { User } from "../user/entities/user.entity";
import { Permission } from "./permission/entities/permission.entity";
import { In } from "typeorm";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionName = this.reflector.get<string>(
      "permission",
      context.getHandler(),
    );
    if (!permissionName) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
      return false;
    }

    const userPermissions: string[] =
      (await this.cacheManager.get(user.getPermissionCacheKey())) ?? [];
    
    if (userPermissions.length === 0) {
      try {
        const userInstance = await user;
        const userRoleArray = await userInstance.roles;
    
        if (userRoleArray.length === 0) {
          console.log('User has no roles');
          return false;
        }
    
        const queryBuilder = Permission.createQueryBuilder('permission')
          .innerJoin('permission.roles', 'role')
          .where('role.id IN (:...roleIds)', { roleIds: userRoleArray.map(role => role.id) })
          .andWhere('permission.name = :permissionName', { permissionName });
    
        const userPermissionArray = await queryBuilder.getMany();
    
        if (userPermissionArray.length > 0) {
          return true
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error.message);
        throw error;
      }
    }

    return userPermissions.includes(permissionName);
  }
}
