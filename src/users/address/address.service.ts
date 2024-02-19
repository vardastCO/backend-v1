import { Injectable, NotFoundException } from "@nestjs/common";
import { City } from "src/base/location/city/entities/city.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { User } from "../user/entities/user.entity";
import { CreateAddressInput } from "./dto/create-address.input";
import { IndexAddressInput } from "./dto/index-address.input";
import { PaginationAddressResponse } from "./dto/pagination-address.response";
import { UpdateAddressInput } from "./dto/update-address.input";
import { Address } from "./entities/address.entity";

@Injectable()
export class AddressService {
  async create(createAddressInput: CreateAddressInput): Promise<Address> {
    const address: Address = Address.create<Address>(createAddressInput);
    await address.save();
    return address;
  }

  async findAll(indexAddressInput?: IndexAddressInput): Promise<Address[]> {
    indexAddressInput.boot();
    const { take, skip } = indexAddressInput || {};
    return await Address.find({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexAddressInput?: IndexAddressInput,
  ): Promise<PaginationAddressResponse> {
    indexAddressInput.boot();
    const { take, skip } = indexAddressInput || {};
    const [data, total] = await Address.findAndCount({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });

    return PaginationAddressResponse.make(indexAddressInput, total, data);
  }

  async findOne(id: number): Promise<Address> {
    const address = await Address.findOneBy({ id });
    if (!address) {
      throw new NotFoundException();
    }
    return address;
  }

  async update(
    id: number,
    updateAddressInput: UpdateAddressInput,
    user: User,
  ): Promise<Address> {
    const address: Address = await Address.preload({
      id,
      ...updateAddressInput,
    });
    if (!address) {
      throw new NotFoundException();
    }

    address.admin = Promise.resolve(user);

    await address.save();
    return address;
  }

  async remove(id: number): Promise<Address> {
    const address: Address = await this.findOne(id);
    await address.remove();
    address.id = id;
    return address;
  }

  async getProvinceOf(address: Address): Promise<Province> {
    return await address.province;
  }

  async getCityOf(address: Address): Promise<City> {
    return await address.city;
  }

  async getAdminOf(address: Address): Promise<User> {
    return await address.admin;
  }
}
