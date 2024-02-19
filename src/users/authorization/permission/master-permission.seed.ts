import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Role } from "../role/entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { PermissionActionsEnum } from "./enums/permission-actions.enum";
import { ResourcePermissionSeed } from "./resource-permission-seed";

export const ADMIN_ROLE_NAME = "admin";

export declare class PermissionSeedObject {
  id?: number;
  name: string;
  displayName: string;
  action: PermissionActionsEnum;
  subject: string;
  conditions?: Object[];
  roleNames?: string[];
  roles?: Role[];
  module?: string;
}

export default abstract class MasterPermissionSeeder {
  private readonly roleRepository: Repository<Role>;

  protected roles: Role[];

  protected roleNameToPermissionIdsMap: { [key: string]: number[] } = {};

  protected abstract module: string;

  protected abstract readonly permissions: (
    | ResourcePermissionSeed
    | PermissionSeedObject
  )[];

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly dataSource: DataSource,
  ) {
    this.roleRepository = dataSource.getRepository(Role);
  }

  async run(): Promise<any> {
    this.roles = await this.roleRepository.find();

    for (const permissionData of this.getPermissions()) {
      if (permissionData instanceof ResourcePermissionSeed) {
        for (const realPermissionData of permissionData.getPermissionsArray()) {
          await this.seedPermission(realPermissionData);
        }
        continue;
      }

      await this.seedPermission(permissionData);
    }

    await this.attachPermissionsToRules();
  }

  protected async attachPermissionsToRules() {
    const rolePermissionsArray = [];
    const roleNameToRoleMap = this.roles.reduce(function (carry, current) {
      carry[current.name] = current;
      return carry;
    }, {});

    for (const roleName in this.roleNameToPermissionIdsMap) {
      this.roleNameToPermissionIdsMap[roleName].forEach(function (
        permissionId,
      ) {
        rolePermissionsArray.push({
          roleId: roleNameToRoleMap[roleName].id,
          permissionId,
        });
      });
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into("users_authorization_role_permissions")
      .values(rolePermissionsArray)
      .orIgnore()
      .execute();
  }

  protected async seedPermission(permissionData: PermissionSeedObject) {
    if (typeof this.module === "undefined" && !permissionData["module"]) {
      throw 'You either have to set moduleName property or have "module" property on each permission on object!';
    }

    await this.permissionRepository.upsert(permissionData, {
      conflictPaths: ["name"],
    });

    await this.appendToRolePermissionsArray(permissionData);
  }

  appendToRolePermissionsArray(permissionData: PermissionSeedObject) {
    Array.isArray(this.roleNameToPermissionIdsMap[ADMIN_ROLE_NAME])
      ? this.roleNameToPermissionIdsMap[ADMIN_ROLE_NAME].push(permissionData.id)
      : (this.roleNameToPermissionIdsMap[ADMIN_ROLE_NAME] = [
          permissionData.id,
        ]);

    for (const roleName of permissionData["roleNames"] ?? []) {
      const roleEntity = this.roles.find(role => role.name === roleName);
      if (!roleEntity) {
        console.error(`Role '${roleName}' does not exists!`);
        continue;
      }

      Array.isArray(this.roleNameToPermissionIdsMap[roleName])
        ? this.roleNameToPermissionIdsMap[roleName].push(permissionData.id)
        : (this.roleNameToPermissionIdsMap[roleName] = [permissionData.id]);
    }
  }

  getPermissions(): (ResourcePermissionSeed | PermissionSeedObject)[] {
    return this.permissions;
  }
}
