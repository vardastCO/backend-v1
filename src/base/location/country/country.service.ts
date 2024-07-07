import {  Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCountryInput } from "./dto/create-country.input";
import { IndexCountryInput } from "./dto/index-country.input";
import { UpdateCountryInput } from "./dto/update-country.input";
import { Country } from "./entities/country.entity";
import { PaginationCountryResponse } from "./dto/pagination-country.response";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import {
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createCountryInput: CreateCountryInput) {
    return await this.countryRepository.save(
      this.countryRepository.create(createCountryInput),
    );
  }

  async findAll(indexCountryInput?: IndexCountryInput): Promise<Country[]> {
    const { take, skip, isActive } = indexCountryInput || {};
    return await this.countryRepository.find({
      skip,
      take,
      where: { isActive },
      order: { sort: "ASC", id: "DESC" },
    });
  }

  async paginate(
    indexCountryInput?: IndexCountryInput,
  ): Promise<PaginationCountryResponse> {
    indexCountryInput.boot();
    const { take, skip, isActive } = indexCountryInput || {};

    const [data, total] = await Country.findAndCount({
      skip,
      take,
      where: { isActive },
      order: { sort: "ASC", id: "DESC" },
    });

    return PaginationCountryResponse.make(indexCountryInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Country> {
    const cacheKey = `country-${id}-${slug}`;
    return this.countryRepository.findOneBy({ id, slug });
  }

  async update(
    id: number,
    updateCountryInput: UpdateCountryInput,
  ): Promise<Country> {
    const country: Country = await this.countryRepository.preload({
      id,
      ...updateCountryInput,
    });
    if (!country) {
      throw new NotFoundException();
    }
    await this.countryRepository.save(country);
    return country;
  }

  async remove(id: number): Promise<Country> {
    const country: Country = await this.findOne(id);
    await this.countryRepository.remove(country);
    country.id = id;
    return country;
  }
}
