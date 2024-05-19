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
import { Country } from "src/base/location/country/entities/country.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permission } from "../authorization/permission.decorator";
import { Permission as PermissionEntity } from "../authorization/permission/entities/permission.entity";
import { Role } from "../authorization/role/entities/role.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { IndexUserInput } from "./dto/index-user.input";
import { PaginationUserResponse } from "./dto/pagination-user.response";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UpdateProfileInput } from "./dto/update-profile.input";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Permission("gql.users.user.store")
  @Mutation(() => User)
  createUser(
    @Args("createUserInput", new ValidationPipe({ transform: true }))
    createUserInput: CreateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.create(createUserInput, currentUser);
  }

  @Permission("gql.users.user.index")
  @Query(() => PaginationUserResponse, { name: "users" })
  findAll(
    @Args(
      "indexUserInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexUserInput?: IndexUserInput,
  ) {
    return this.userService.paginate(indexUserInput);
  }

  @Permission("gql.users.user.show")
  @Query(() => User, { name: "user" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("uuid", { nullable: true }) uuid: string,
  ) {
    return this.userService.findOne(id, uuid);
  }

  @Permission("gql.users.user.update")
  @Mutation(() => User)
  updateUser(
    @Args("updateUserInput") updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.update(
      updateUserInput.id,
      updateUserInput,
      currentUser,
    );
  }
  @Permission("gql.base.event_tracker.create")
  @Mutation(() => User)
  updateProfile(
    @Args("updateProfileInput") updateProfileInput: UpdateProfileInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.updateProfile(
      updateProfileInput,
      currentUser,
    );
  }

  @Permission("gql.users.user.destroy")
  @Mutation(() => User)
  removeUser(@Args("id", { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }

  @ResolveField(returns => Country)
  country(@Parent() user: User): Promise<Country> {
    return this.userService.getCountry(user);
  }

  @ResolveField(returns => [Role])
  roles(@Parent() user: User): Promise<Role[]> {
    return this.userService.getRoles(user);
  }

  @ResolveField(returns => [Permission])
  permissions(@Parent() user: User): Promise<PermissionEntity[]> {
    return this.userService.getPermissions(user);
  }

  @ResolveField(returns => Seller)
  seller(@Parent() user: User): Promise<Seller> {
    return this.userService.getSellerRecordOf(user);
  }
}
