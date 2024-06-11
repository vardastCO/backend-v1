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
import { IndexLegalInput } from "./dto/index-legal.input";
import { PaginationLegalResponse } from "./dto/pagination-legal.response";
import { ContactInfo } from "../contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "../contact-info/enums/contact-info-related-types.enum";
import { Address } from "../address/entities/address.entity";
import { AddressRelatedTypes } from "../address/enums/address-related-types.enum";

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
        await this.i18n.translate("exceptions.FOUND_LEGAL"),
      );
    }
    let id = userId
    if (createLegalInput.cellphone) {
      id = (await await User.findOneBy({cellphone :createLegalInput.cellphone})).id
    }
    const legal: Legal = Legal.create<Legal>(createLegalInput);
    legal.createdById = id
    await legal.save();
    return legal;

  }

  async update(id: number, updateLegalInput: UpdateLegalInput, userId: number): Promise<Legal> {
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    Object.assign(legal, updateLegalInput);
    let user_id = userId
    if (updateLegalInput.cellphone) {
      user_id = (await await User.findOneBy({cellphone :updateLegalInput.cellphone})).id
    }
    legal.createdById = user_id
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

  async findAll(indexLegalInput: IndexLegalInput): Promise<PaginationLegalResponse> {
    indexLegalInput.boot()
    const { take, skip } =
      indexLegalInput || {};
      const [data, total] = await Legal.findAndCount({
        take,
        skip,
        // relations: [ "contacts"],
      });
  
    return PaginationLegalResponse.make(indexLegalInput, total, data);

  }

  async findOne(id: number): Promise<Legal> {

    const legalPromise = Legal.findOneBy({ id });
    
    const contactsPromise = ContactInfo.find({
      where: {
        relatedType: ContactInfoRelatedTypes.LEGAL,
        relatedId: id,
      },
    });
  
    const addressesPromise = Address.find({
      where: {
        relatedType: AddressRelatedTypes.LEGAL,
        relatedId: id,
      },
    });
  
    const [legal, contacts, addresses] = await Promise.all([legalPromise, contactsPromise, addressesPromise]);
  
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    legal.contacts = contacts;
    legal.addresses = addresses;
  
    return legal;
  }
  
}
