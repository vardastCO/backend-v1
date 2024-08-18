import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { City } from "src/base/location/city/entities/city.entity";
import { Province } from "../../base/location/province/entities/province.entity";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permission } from "../authorization/permission.decorator";
import { User } from "../user/entities/user.entity";
import { AddressService } from "./address.service";
import { CreateAddressInput } from "./dto/create-address.input";
import { IndexAddressInput } from "./dto/index-address.input";
import { PaginationAddressResponse } from "./dto/pagination-address.response";
import { UpdateAddressInput } from "./dto/update-address.input";
import { Address } from "./entities/address.entity";
import { ReferrersEnum } from "src/referrers.enum";

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => Address)
  createAddress(
    @Args("createAddressInput") createAddressInput: CreateAddressInput,
    @CurrentUser() user: User,
    @Context() context?: { req: Request },
    
  ) {

    const request = context?.req;
    const referer = request.headers["origin"] ?? null;
    const admin = [
      ReferrersEnum.ADMIN_COM,
      ReferrersEnum.ADMIN_IR,
    ].includes(referer);
    return this.addressService.create(createAddressInput,user,admin);
  }

  @Permission("gql.users.address.store")
  @Query(() => PaginationAddressResponse, { name: "addresses" })
  findAll(
    @Args(
      "indexAddressInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexAddressInput?: IndexAddressInput,
    @CurrentUser() user?: User,
  ) {
    return this.addressService.paginate(indexAddressInput,user);
  }

  @Permission("gql.users.address.show")
  @Query(() => Address, { name: "address" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.addressService.findOne(id);
  }

  @Permission("gql.users.address.update")
  @Mutation(() => Address)
  updateAddress(
    @Args("updateAddressInput") updateAddressInput: UpdateAddressInput,
    @CurrentUser() user: User,
  ) {
    return this.addressService.update(
      updateAddressInput.id,
      updateAddressInput,
      user,
    );
  }

  @Permission("gql.users.address.destroy")
  @Mutation(() => Address)
  removeAddress(@Args("id", { type: () => Int }) id: number) {
    return this.addressService.remove(id);
  }

  @ResolveField(() => Province)
  async province(@Parent() address: Address): Promise<Province> {
    return this.addressService.getProvinceOf(address);
  }

  @ResolveField(() => City)
  async city(@Parent() address: Address): Promise<City> {
    return this.addressService.getCityOf(address);
  }

  @ResolveField(() => User)
  async admin(@Parent() address: Address): Promise<User> {
    return this.addressService.getAdminOf(address);
  }
}
