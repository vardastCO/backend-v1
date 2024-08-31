import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IndexPermissionInput } from "./dto/index-permission.input";
import { PaginationPermissionResponse } from "./dto/pagination-permission.response";
import { UpdatePermissionInput } from "./dto/update-permission.input";
import { Permission } from "./entities/permission.entity";
import { DataSource } from "typeorm";

// @Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(
    indexPermissionInput?: IndexPermissionInput,
  ): Promise<Permission[]> {
    const { take, skip, subject, action, displayName } =
      indexPermissionInput || {};
    return await this.permissionRepository.find({
      skip,
      take,
      where: { subject, action, displayName },
      order: { id: "ASC" },
    });
  }

  async paginate(
    indexPermissionInput?: IndexPermissionInput,
  ): Promise<PaginationPermissionResponse> {
    indexPermissionInput.boot();
    const { take, skip, subject, action, displayName } =
      indexPermissionInput || {};
    const [data, total] = await Permission.findAndCount({
      where: { subject, action, displayName },
      order: { id: "ASC" },
    });

    const uniqueClaims = Array.from(
      new Map(data.map(item => [item.claim, item])).values(),
    );

    const paginatedData = uniqueClaims.slice(skip, skip + take);

    return PaginationPermissionResponse.make(
      indexPermissionInput,
      total,
      paginatedData,
    );
  }

  async allClaim(): Promise<Permission[]> {
    return await Permission.find({
      select: ["claim"],
    });
  }

  async findOne(id: number, name?: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({ id, name });
    if (!permission) {
      throw new NotFoundException();
    }
    return permission;
  }

  async update(
    id: number,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission> {
    const permission: Permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionInput,
    });
    if (!permission) {
      throw new NotFoundException();
    }
    await this.permissionRepository.save(permission);
    return permission;
  }
}
