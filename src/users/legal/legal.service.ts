import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { User } from "../user/entities/user.entity";
import { In } from 'typeorm';
import { I18n, I18nService } from "nestjs-i18n";
import { Like } from 'typeorm';
import { Legal } from "./entities/legal.entity";
import { CreateLegalInput } from "./dto/create-legal.input";
import { UpdateLegalInput } from "./dto/update-legal.input";

@Injectable()
export class LegalService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @I18n() protected readonly i18n: I18nService,
  ) {}

  async create(createLegalInput: CreateLegalInput, userId: number): Promise<Legal> {
    const findLegal = await Legal.findOneBy({
      national_id: createLegalInput.national_id,
    });
    if (findLegal) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.NOT_FOUND_USER"),
      );
    }
    const legal: Legal = Legal.create<Legal>(createLegalInput);
    await legal.save();
    return legal;

  }

  async update(id: number, updateLegalInput: UpdateLegalInput, userId: number): Promise<Legal> {
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    Object.assign(legal, updateLegalInput);
    await legal.save();
    return legal;
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    await Legal.remove(legal);
    return true;
  }

  async findAll(): Promise<Legal[]> {
    return await Legal.find();
  }

  async findOne(id: number): Promise<Legal> {
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    return legal;
  }
}
