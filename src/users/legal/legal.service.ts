import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { Like } from 'typeorm';
import { Address } from "../address/entities/address.entity";
import { AddressRelatedTypes } from "../address/enums/address-related-types.enum";
import { ContactInfo } from "../contact-info/entities/contact-info.entity";
import { ContactInfoRelatedTypes } from "../contact-info/enums/contact-info-related-types.enum";
import { Member } from "../member/entities/members.entity";
import { TypeMember } from "../member/enums/type-member.enum";
import { User } from "../user/entities/user.entity";
import { CreateLegalInput } from "./dto/create-legal.input";
import { IndexLegalInput } from "./dto/index-legal.input";
import { PaginationLegalResponse } from "./dto/pagination-legal.response";
import { UpdateLegalInput } from "./dto/update-legal.input";
import { Legal } from "./entities/legal.entity";

@Injectable()
export class LegalService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @I18n() protected readonly i18n: I18nService,
  ) {}


  
  async checkLegalExists(national_id, name_company) {
    const [legalByNationalId, legalByCompanyName] = await Promise.all([
      Legal.findOneBy({
        national_id: national_id,
      }),
      Legal.findOne({
        where : {name_company: name_company}
      })
    ]);

    if (legalByCompanyName) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.FOUND_LEGAL_BY_COMPANY_NAME"),
      );
    }

    if (legalByNationalId) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.FOUND_LEGAL_BY_NATIONAL_ID"),
      );
    }
  }

  async create(createLegalInput: CreateLegalInput, userId: number): Promise<Legal> {
    createLegalInput.name_company = createLegalInput.name_company?.replace(/ي/g, "ی").replace(/ك/g, "ک")?.trim();
    
    await this.checkLegalExists(createLegalInput.national_id, createLegalInput.name_company);


    if (createLegalInput.accountNumber) {
      createLegalInput.accountNumber = createLegalInput.accountNumber.replace(/[0-9۰-۹]/g, '');
      if (createLegalInput.accountNumber?.length != 11) {
          throw new BadRequestException(
          await this.i18n.translate("exceptions.ACCOUNT_NUMBER"),
      );
      }
    }

    if (createLegalInput.shabaNumber) {
        createLegalInput.shabaNumber = createLegalInput.shabaNumber.replace(/[0-9۰-۹]/g, '');
        const validShabaNumber = `${Legal.SHABA_COUNTRY_CODE}${createLegalInput.shabaNumber}`
      if (validShabaNumber?.length != 26) {
          throw new BadRequestException(
          await this.i18n.translate("exceptions.SHABA_NUMBER"),
      );
        }
        createLegalInput.shabaNumber = validShabaNumber;
    }
    
    let id = userId
    if (createLegalInput.cellphone) {
      let findUserId = (await await User.findOneBy({ cellphone: createLegalInput.cellphone })).id
      if (!findUserId) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
        );
      }
      id = findUserId
    }

    
    const legal: Legal = Legal.create<Legal>(createLegalInput);
    legal.ownerId = id
    legal.createdById = userId
    await legal.save();

    const member = new Member();
    member.relatedId = legal.id
    member.userId = userId
    // member.adminId = userId
    member.position = 'مدیرعامل'
    await member.save();
    
    return legal;

  }

  async update(id: number, updateLegalInput: UpdateLegalInput, userId: number): Promise<Legal> {
    updateLegalInput.name_company = updateLegalInput.name_company?.replace(/ي/g, "ی").replace(/ك/g, "ک")?.trim();
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    await this.checkLegalExists(updateLegalInput.national_id, updateLegalInput.name_company);
    
    Object.assign(legal, updateLegalInput);
    let user_id = userId
    if (updateLegalInput.cellphone) {
      let findUser = (await await User.findOneBy({ cellphone: updateLegalInput.cellphone })).id
      if (!findUser) {
        throw new BadRequestException(
          (await this.i18n.translate("exceptions.NOT_FOUND_USER")),
        );
      }
      user_id = findUser
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
    
    await Member.delete({ relatedId: legal.id });
    await legal.remove();
    return true;
  }

  async findAll(indexLegalInput: IndexLegalInput): Promise<PaginationLegalResponse> {
    indexLegalInput.boot()
    const { take, skip,nameOrUuid } =
      indexLegalInput || {};
    const whereConditions: any = {};
  
    if (nameOrUuid) {
      whereConditions['name_company'] =  Like(`%${nameOrUuid}%`)

    }
    const [data, total] = await Legal.findAndCount({
        where:whereConditions,
        take,
        skip,
        order: {
          id:'DESC'
        }
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

    const membersPromise = Member.find({
      where: {
        type: TypeMember.LEGAL,
        relatedId: id,
      },
    });
  
    const [legal, contacts, addresses,members] = await Promise.all([legalPromise, contactsPromise, addressesPromise,membersPromise]);
  
    if (!legal) {
      throw new NotFoundException('Legal entity not found');
    }
    legal.contacts = contacts;
    legal.members = members;
    legal.addresses = addresses;
  
    return legal;
  }
  
}
