import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Permission as PermissionGuard } from "../permission.decorator";
import { Permission } from "../permission/entities/permission.entity";
import { CreateRoleInput } from "./dto/create-role.input";
import { IndexRoleInput } from "./dto/index-role.input";
import { PaginationRoleResponse } from "./dto/pagination-role.response";
import { UpdateRoleInput } from "./dto/update-role.input";
import { Role } from "./entities/role.entity";
import { RoleService } from "./role.service";

@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @PermissionGuard("gql.users.authorization.role.store")
  @Mutation(() => Role)
  createRole(@Args("createRoleInput") createRoleInput: CreateRoleInput) {
    return this.roleService.create(createRoleInput);
  }

  @PermissionGuard("gql.users.authorization.role.index")
  @Query(() => PaginationRoleResponse, { name: "roles" })
  findAll(
    @Args(
      "indexRoleInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexRoleInput?: IndexRoleInput,
  ) {
    return this.roleService.paginate(indexRoleInput);
  }

  @PermissionGuard("gql.users.authorization.role.show")
  @Query(() => Role, { name: "role" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.roleService.findOne(id);
  }

  @PermissionGuard("gql.users.authorization.role.update")
  @Mutation(() => Role)
  updateRole(@Args("updateRoleInput") updateRoleInput: UpdateRoleInput) {
    return this.roleService.update(updateRoleInput.id, updateRoleInput);
  }

  @PermissionGuard("gql.users.authorization.role.destroy")
  @Mutation(() => Role)
  removeRole(@Args("id", { type: () => Int }) id: number) {
    return this.roleService.remove(id);
  }

  @ResolveField(returns => [Permission])
  async permissions(@Parent() role: Role): Promise<Permission[]> {
    return (await role.permissions) || [];
  }
}
