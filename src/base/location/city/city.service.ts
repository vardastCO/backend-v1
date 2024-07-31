import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { CreateCityInput } from "./dto/create-city.input";
import { IndexCityInput } from "./dto/index-city.input";
import { UpdateCityInput } from "./dto/update-city.input";
import { City } from "./entities/city.entity";
import { PaginationCityResponse } from "./dto/pagination-city.response";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
  ) {}

  async create(createCityInput: CreateCityInput): Promise<City> {
    const city: City = await this.cityRepository.save(createCityInput);
    return city;
  }

  async findAll(indexCityInput?: IndexCityInput): Promise<City[]> {
    const { take, skip, provinceId, parentCityId } = indexCityInput || {};

    // Generate a unique cache key based on the input parameters
    const cacheKey = `city_findAll_${JSON.stringify({ take, skip, provinceId, parentCityId })}`;

    const cachedCities = await this.cacheManager.get<string>(cacheKey);

    if (cachedCities !== undefined) {
      return this.decompressionService.decompressData(cachedCities);
    }

    const cities = await this.cityRepository.find({
      take,
      skip,
      where: { provinceId, parentCityId },
      order: { sort: 'ASC', id: 'DESC' },
    });

    await this.cacheManager.set(cacheKey,this.compressionService.compressData(cities),CacheTTL.TWO_WEEK); 

    return cities;
  }

  async paginate(
    indexCityInput?: IndexCityInput,
  ): Promise<PaginationCityResponse> {
    indexCityInput.boot();
    const { take, skip, provinceId, parentCityId, name } = indexCityInput || {};
    const cacheKey = `city_paginations_${JSON.stringify(indexCityInput)}`;
    console.log('take',take,skip)
    const cachedCities = await this.cacheManager.get<string>(cacheKey);
    if (cachedCities) {
      return this.decompressionService.decompressData(cachedCities);
    }
    console.log('take',take,skip)
    const [data, total] = await City.findAndCount({
      take,
      skip,
      where: { provinceId, parentCityId , name : Like(`%${name}%`)},
      order: { sort: "ASC", id: "DESC" },
    });

    const result = PaginationCityResponse.make(indexCityInput, total, data);
    
    await this.cacheManager.set(cacheKey, this.compressionService.compressData(result), CacheTTL.TWO_WEEK);
    
    return result
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
    const cacheKey = `city_count_${provinceId}_${parentCityId}`;

    const cachedCount = await this.cacheManager.get<string>(cacheKey);

    if (cachedCount !== undefined) {

      return this.decompressionService.decompressData(cachedCount);
    }

    const count = await this.cityRepository.count({
      where: { provinceId, parentCityId },
      order: { sort: "ASC" },
    });

    await this.cacheManager.set(cacheKey,this.compressionService.compressData(count), CacheTTL.TWO_WEEK); 

    return count;
  }
}
