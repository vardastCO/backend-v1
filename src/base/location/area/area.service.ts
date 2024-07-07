import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAreaInput } from "./dto/create-area.input";
import { IndexAreaInput } from "./dto/index-area.input";
import { PaginationAreaResponse } from "./dto/pagination-area.response";
import { UpdateAreaInput } from "./dto/update-area.input";
import { Area } from "./entities/area.entity";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private areaRepository: Repository<Area>,
  ) {}

  async create(createAreaInput: CreateAreaInput): Promise<Area> {
    return await this.areaRepository.save(createAreaInput);
  }

  async findAll(indexAreaInput?: IndexAreaInput): Promise<Area[]> {
    const { take, skip, cityId } = indexAreaInput || {};
    
    const cacheKey = `find-all-area-${cityId}-${take}-${skip}`;

    const cachedResult = await this.cacheManager.get<any[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const result = await this.areaRepository.find({
      take,
      skip,
      where: { cityId },
    });

    await this.cacheManager.set(cacheKey, result,CacheTTL.TWO_WEEK); 

    return result;
  }

  async paginate(
    indexAreaInput?: IndexAreaInput,
  ): Promise<PaginationAreaResponse> {
    indexAreaInput.boot();
    const { take, skip, cityId } = indexAreaInput || {};
    const [data, total] = await Area.findAndCount({
      take,
      skip,
      where: { cityId },
      order: { sort: "ASC", id: "DESC" },
    });

    return PaginationAreaResponse.make(indexAreaInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Area> {
    const area = await this.areaRepository.findOneBy({ id, slug });
    if (!area) {
      throw new NotFoundException();
    }
    return area;
  }

  async update(id: number, updateAreaInput: UpdateAreaInput): Promise<Area> {
    const area: Area = await this.areaRepository.preload({
      id,
      ...updateAreaInput,
    });
    if (!area) {
      throw new NotFoundException();
    }
    await this.areaRepository.save(area);
    return area;
  }

  async remove(id: number): Promise<Area> {
    const area: Area = await this.findOne(id);
    await this.areaRepository.remove(area);
    area.id = id;
    return area;
  }

  async count(indexAreaInput?: IndexAreaInput): Promise<number> {
    const { cityId } = indexAreaInput || {};
    const cacheKey = `count-${cityId}-city-id`;

    const cachedCount = await this.cacheManager.get<number>(cacheKey);
    if (cachedCount !== undefined) {
      return cachedCount;
    }

    const count = await this.areaRepository.count({
      where: { cityId },
    });

    await this.cacheManager.set(cacheKey, count, CacheTTL.TWO_WEEK); 

    return count;
  }
}
