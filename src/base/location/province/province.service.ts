import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProvinceInput } from "./dto/create-province.input";
import { IndexProvinceInput } from "./dto/index-province.input";
import { PaginationProvinceResponse } from "./dto/pagination-province.response";
import { UpdateProvinceInput } from "./dto/update-province.input";
import { Province } from "./entities/province.entity";

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  async create(createProvinceInput: CreateProvinceInput): Promise<Province> {
    return await this.provinceRepository.save(createProvinceInput);
  }

  async findAll(indexProvinceInput?: IndexProvinceInput): Promise<Province[]> {
    
    const { take, skip, countryId } = indexProvinceInput || {};
    return await this.provinceRepository.find({
      skip,
      take,
      where: { countryId },
      order: { sort: "ASC", id: "DESC" },
    });
  }

  async paginate(
    indexProvinceInput?: IndexProvinceInput,
  ): Promise<PaginationProvinceResponse> {
    indexProvinceInput.boot();
    const { take, skip, countryId } = indexProvinceInput || {};
    const [data, total] = await Province.findAndCount({
      skip,
      take,
      where: { countryId },
      order: { sort: "ASC", id: "DESC" },
    });

    return PaginationProvinceResponse.make(indexProvinceInput, total, data);
  }

  async findOne(id: number, slug?: string): Promise<Province> {
    const province = await this.provinceRepository.findOneBy({ id, slug });
    if (!province) {
      throw new NotFoundException();
    }
    return province;
  }

  async update(
    id: number,
    updateProvinceInput: UpdateProvinceInput,
  ): Promise<Province> {
    const province: Province = await this.provinceRepository.preload({
      id,
      ...updateProvinceInput,
    });
    if (!province) {
      throw new NotFoundException();
    }
    await this.provinceRepository.save(province);
    return province;
  }

  async remove(id: number): Promise<Province> {
    const province: Province = await this.findOne(id);
    await this.provinceRepository.remove(province);
    province.id = id;
    return province;
  }

  async count(indexProvinceInput: IndexProvinceInput): Promise<number> {
    return await this.provinceRepository.count({ where: indexProvinceInput });
  }
}
