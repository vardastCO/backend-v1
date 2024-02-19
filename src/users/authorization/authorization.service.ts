import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AuthorizationService {
  private user: User;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // this.user = GqlExecutionContext.create(context).getContext().req.user;
  }

  public setUser(user: User): this {
    this.user = user;
    return this;
  }

  async hasPermission(permissionName: string): Promise<boolean> {
    if (!this.user) return false;

    const userPermissions: string[] =
      (await this.cacheManager.get(this.user.getPermissionCacheKey())) ?? [];

    return userPermissions.includes(permissionName);
  }

  // async hasPermissions(
  //   permissionNames: string[],
  //   requireAll: boolean = true,
  // ): Promise<boolean> {
  //   const userPermissions: string[] =
  //     (await this.cacheManager.get(this.getPermissionCacheKey())) ?? [];

  //   return userPermissions.includes(permissionName);
  // },

  async hasRole(roleName: string): Promise<boolean> {
    if (!this.user) return false;

    const userRoles: string[] =
      (await this.cacheManager.get(this.user.getRoleCacheKey())) ?? [];

    return userRoles.includes(roleName);
  }
}
