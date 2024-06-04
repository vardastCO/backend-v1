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
import { DataSource } from "typeorm";
import { Permission as PermissionGuard } from "../permission.decorator";
import { Role } from "../role/entities/role.entity";
import { IndexPermissionInput } from "./dto/index-permission.input";
import { PaginationPermissionResponse } from "./dto/pagination-permission.response";
import { UpdatePermissionInput } from "./dto/update-permission.input";
import { Permission } from "./entities/permission.entity";
import { PermissionService } from "./permission.service";

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly dataSource: DataSource,
  ) {}

  @PermissionGuard("gql.users.authorization.permission.index")
  @Query(() => PaginationPermissionResponse, { name: "permissions" })
  findAll(
    @Args(
      "indexPermissionInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPermissionInput?: IndexPermissionInput,
  ) {
    return this.permissionService.paginate(indexPermissionInput);
  }

  @PermissionGuard("gql.users.authorization.permission.index")
  @Query(() => [Permission], { name: "permissions" })
  allClaim() {
    return this.permissionService.allClaim();
  }

  @PermissionGuard("gql.users.authorization.permission.show")
  @Query(() => Permission, { name: "permission" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("name", { type: () => String, nullable: true }) name: string,
  ) {
    return this.permissionService.findOne(id, name);
  }

  @PermissionGuard("gql.users.authorization.permission.update")
  @Mutation(() => Permission)
  updatePermission(
    @Args("updatePermissionInput") updatePermissionInput: UpdatePermissionInput,
  ) {
    return this.permissionService.update(
      updatePermissionInput.id,
      updatePermissionInput,
    );
  }

  @ResolveField(type => [Role])
  async roles(@Parent() permission: Permission): Promise<Role[]> {
    return (await permission.roles) || [];
  }
}
