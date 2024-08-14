import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateRoleInput } from "./dto/create-role.input";
import { IndexRoleInput } from "./dto/index-role.input";
import { PaginationRoleResponse } from "./dto/pagination-role.response";
import { UpdateRoleInput } from "./dto/update-role.input";
import { Role } from "./entities/role.entity";
import { Permission } from "../permission/entities/permission.entity";


@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleInput: CreateRoleInput): Promise<Role> {
    if (createRoleInput.claims.length > 0) {
      const permissions = await Permission.find({
        select: ['id'],
        where: {
          claim: In(createRoleInput.claims)
        }
      });
      
      createRoleInput.permissionIds = permissions.map(permission => permission.id);
    }
    
    return await this.roleRepository.save(createRoleInput);
  }

  async findAll(indexRoleInput?: IndexRoleInput): Promise<Role[]> {
    const { take, skip, isActive } = indexRoleInput || {};
    return await this.roleRepository.find({
      skip,
      take,
      where: { isActive },
      order: { displayName: "ASC", id: "DESC" },
    });
  }

  async paginate(
    indexRoleInput?: IndexRoleInput,
  ): Promise<PaginationRoleResponse> {
    indexRoleInput.boot();
    const { take, skip, isActive } = indexRoleInput || {};
    const [data, total] = await Role.findAndCount({
      skip,
      take,
      where: { isActive },
      order: { displayName: "ASC", id: "DESC" },
    });

    return PaginationRoleResponse.make(indexRoleInput, total, data);
  }

  async findOne(id: number, name?: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id, name });
    if (!role) {
      throw new NotFoundException();
    }
    return role;
  }

  async update(id: number, updateRoleInput: UpdateRoleInput): Promise<Role> {
    const role: Role = await this.roleRepository.preload({
      id,
      ...updateRoleInput,
    });
    if (!role) {
      throw new NotFoundException();
    }
    await this.roleRepository.save(role);
    return role;
  }

  async remove(id: number): Promise<Role> {
    const role: Role = await this.findOne(id);
    await this.roleRepository.remove(role);
    role.id = id;
    return role;
  }
}
