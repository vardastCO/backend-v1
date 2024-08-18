import { Injectable, NotFoundException } from "@nestjs/common";
import { City } from "src/base/location/city/entities/city.entity";
import { Province } from "src/base/location/province/entities/province.entity";
import { User } from "../user/entities/user.entity";
import { CreateAddressInput } from "./dto/create-address.input";
import { IndexAddressInput } from "./dto/index-address.input";
import { PaginationAddressResponse } from "./dto/pagination-address.response";
import { UpdateAddressInput } from "./dto/update-address.input";
import { Address } from "./entities/address.entity";
import { AddressRelatedTypes } from "./enums/address-related-types.enum";
import { Country } from "src/base/location/country/entities/country.entity";
import { AuthorizationService } from "../authorization/authorization.service";

@Injectable()
export class AddressService {
  constructor(
    private authorizationService: AuthorizationService,
  ) {}
  async create(createAddressInput: CreateAddressInput, user: User,admin:boolean): Promise<Address> {
    const userAuth = await this.authorizationService.setUser(user);
    let related_id = user.id
    if (userAuth.hasRole("admin") && admin && createAddressInput.relatedType === AddressRelatedTypes.USER ) {
      related_id = createAddressInput.relatedId
    }
    const address: Address = Address.create<Address>({
      ...createAddressInput,
      countryId: Country.IR,
      relatedId: related_id
    });

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
    user?:User
  ): Promise<PaginationAddressResponse> {
    indexAddressInput.boot();
    const { take, skip, relatedType ,relatedId } = indexAddressInput || {};
  
    const whereCondition: any = {};
  
    if (relatedType === AddressRelatedTypes.USER) {
      whereCondition.relatedId = user.id;
      whereCondition.relatedType = AddressRelatedTypes.USER;
    }
    if (relatedType && relatedId) {
      whereCondition.relatedId = relatedId;
      whereCondition.relatedType = relatedType;
    } 


    const [data, total] = await Address.findAndCount({
      skip,
      take,
      where: whereCondition,
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
    const result = address
    await address.remove();
    result.id = id;
    return result;
  
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
