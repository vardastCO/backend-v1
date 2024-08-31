import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { User } from "../user/entities/user.entity";
import { EntityManager } from "typeorm";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
@Injectable()
export class AuthorizationService {
  private user: User;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly entityManager: EntityManager,
  ) {
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
    const cacheKey = `hasRole_admin_{${JSON.stringify(this.user.id)}}`;
    const cachedData = await this.cacheManager.get<boolean>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const roleIdToCheck = 2;

    const query = `
      SELECT * 
      FROM users_authorization_user_roles 
      WHERE "userId" = $1 
        AND "roleId" = $2
    `;

    try {
      const userRoles = await this.entityManager.query(query, [
        this.user.id,
        roleIdToCheck,
      ]);
      await this.cacheManager.set(
        cacheKey,
        userRoles.length > 0,
        CacheTTL.ONE_WEEK,
      );
      return userRoles.length > 0;
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return false;
    }
  }
}
