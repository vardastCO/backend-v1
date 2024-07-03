import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Like } from "typeorm";
import { Attribute } from "../attribute/entities/attribute.entity";
import { Product } from "../product/entities/product.entity";
import { CreateUomInput } from "./dto/create-uom.input";
import { IndexUomInput } from "./dto/index-uom.input";
import { PaginationUomResponse } from "./dto/pagination-uom.response";
import { UpdateUomInput } from "./dto/update-uom.input";
import { Uom } from "./entities/uom.entity";
@Injectable()
export class UomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async create(createUomInput: CreateUomInput): Promise<Uom> {
    const uom: Uom = Uom.create<Uom>(createUomInput);
    await uom.save();
    return uom;
  }

  async findAll(indexUomInput?: IndexUomInput): Promise<Uom[]> {
    const cacheKey = `find_all_uom_${JSON.stringify(indexUomInput)}`;

    // Try to get the result from the cache
    const cachedResult = await this.cacheManager.get<Uom[]>(cacheKey);

    if (cachedResult) {
      // Return the cached result if available
      return cachedResult;
    } else {
      const { take, skip, name, isActive } = indexUomInput || {};
      const result = await Uom.find({
        skip,
        take,
        where: name
          ? { isActive, name: Like(`%${name.replace(" ", "%")}%`) }
          : { isActive },
        order: { id: "DESC" },
      });

      // Store the result in the cache with a defined TTL (time-to-live)
      await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK); // Set a TTL of 60 seconds, adjust as needed

      return result;
    }
  }

  async paginate(
    indexUomInput?: IndexUomInput,
  ): Promise<PaginationUomResponse> {
    indexUomInput.boot();
    const { take, skip, name, isActive } = indexUomInput || {};
    const [data, total] = await Uom.findAndCount({
      skip,
      take,
      where: name
        ? { isActive, name: Like(`%${name.replace(" ", "%")}%`) }
        : { isActive },
      order: { id: "DESC" },
    });

    return PaginationUomResponse.make(indexUomInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Uom> {
    const uom = await Uom.findOneBy({ id, slug });
    if (!uom) {
      throw new NotFoundException();
    }
    return uom;
  }

  async update(id: number, updateUomInput: UpdateUomInput): Promise<Uom> {
    const uom: Uom = await Uom.preload({
      id,
      ...updateUomInput,
    });
    if (!uom) {
      throw new NotFoundException();
    }
    await uom.save();
    return uom;
  }

  async remove(id: number): Promise<Uom> {
    const uom: Uom = await this.findOne(id);
    await uom.remove();
    uom.id = id;
    return uom;
  }

  async getProductsOf(uom: Uom): Promise<Product[]> {
    return await uom.products;
  }

  async getAttributesOf(uom: Uom): Promise<Attribute[]> {
    return await uom.attributes;
  }
}
