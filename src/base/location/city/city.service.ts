import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCityInput } from "./dto/create-city.input";
import { IndexCityInput } from "./dto/index-city.input";
import { UpdateCityInput } from "./dto/update-city.input";
import { City } from "./entities/city.entity";
import { PaginationCityResponse } from "./dto/pagination-city.response";

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async create(createCityInput: CreateCityInput): Promise<City> {
    const city: City = await this.cityRepository.save(createCityInput);
    return city;
  }

  async findAll(indexCityInput?: IndexCityInput): Promise<City[]> {
    const { take, skip, provinceId, parentCityId } = indexCityInput || {};
    return await this.cityRepository.find({
      take,
      skip,
      where: { provinceId, parentCityId },
      order: { sort: "ASC", id: "DESC" },
    });
  }

  async paginate(
    indexCityInput?: IndexCityInput,
  ): Promise<PaginationCityResponse> {
    indexCityInput.boot();
    const { take, skip, provinceId, parentCityId } = indexCityInput || {};
    const [data, total] = await City.findAndCount({
      take,
      skip,
      where: { provinceId, parentCityId },
      order: { sort: "ASC", id: "DESC" },
    });

    return PaginationCityResponse.make(indexCityInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<City> {
    const city = await this.cityRepository.findOneBy({ id, slug });
    if (!city) {
      throw new NotFoundException();
    }
    return city;
  }

  async update(id: number, updateCityInput: UpdateCityInput): Promise<City> {
    const city: City = await this.cityRepository.preload({
      id,
      ...updateCityInput,
    });
    if (!city) {
      throw new NotFoundException();
    }
    await this.cityRepository.save(city);
    return city;
  }

  async remove(id: number): Promise<City> {
    const city: City = await this.findOne(id);
    await this.cityRepository.remove(city);
    city.id = id;
    return city;
  }

  async count(indexCityInput?: IndexCityInput): Promise<number> {
    const { provinceId, parentCityId } = indexCityInput || {};
    return await this.cityRepository.count({
      where: { provinceId, parentCityId },
      order: { sort: "ASC" },
    });
  }
}
