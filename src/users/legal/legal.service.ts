import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { I18n, I18nService } from "nestjs-i18n";
import { Like } from "typeorm";
import { Address } from "../address/entities/address.entity";
import { AddressRelatedTypes } from "../address/enums/address-related-types.enum";
import { AuthorizationService } from "../authorization/authorization.service";
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
import { LegalStateEnum } from "./enum/legalState.enum";

@Injectable()
export class LegalService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @I18n() protected readonly i18n: I18nService,
    private authorizationService: AuthorizationService,
  ) {}

  async checkLegalExists(
    national_id: any,
    name_company: any,
    currentLegalId = null,
  ): Promise<Boolean> {
    // const whereNationalId: any = { national_id }
    const whereCondition: any = [];

    if (name_company) {
      whereCondition.push({ name_company: name_company });
    }

    if (national_id) {
      whereCondition.push({ national_id: national_id });
    }

    // Fetch records concurrently
    const legals = (
      await Legal.find({
        where: whereCondition,
      })
    ).filter(legal => legal.id != currentLegalId);

    const legalByNationalId = legals.some(
      legal => legal.national_id == national_id,
    );
    if (legalByNationalId) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.FOUND_LEGAL_BY_NATIONAL_ID"),
      );
    }

    const legalByNameCompany = legals.some(
      legal => legal.name_company == name_company,
    );
    if (legalByNameCompany) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.FOUND_LEGAL_BY_COMPANY_NAME"),
      );
    }

    if (legals.length > 0) {
      return true;
    }
    return false;
  }

  async create(createLegalInput: CreateLegalInput, user: User): Promise<Legal> {
    createLegalInput.name_company = createLegalInput.name_company
      ?.replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      ?.trim();

    await this.checkLegalExists(
      createLegalInput.national_id,
      createLegalInput.name_company,
    );

    if (createLegalInput.accountNumber) {
      createLegalInput.accountNumber = createLegalInput.accountNumber.replace(
        /[0-9۰-۹]/g,
        "",
      );
      if (createLegalInput.accountNumber?.length != 11) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.ACCOUNT_NUMBER"),
        );
      }
    }

    if (createLegalInput.shabaNumber) {
      createLegalInput.shabaNumber = createLegalInput.shabaNumber.replace(
        /[0-9۰-۹]/g,
        "",
      );
      const validShabaNumber = `${Legal.SHABA_COUNTRY_CODE}${createLegalInput.shabaNumber}`;
      if (validShabaNumber?.length != 26) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.SHABA_NUMBER"),
        );
      }
      createLegalInput.shabaNumber = validShabaNumber;
    }

    let id = user.id;
    if (
      createLegalInput.cellphone &&
      (await this.authorizationService.setUser(user).hasRole("admin"))
    ) {
      let findUserId = (
        await await User.findOneBy({ cellphone: createLegalInput.cellphone })
      ).id;
      if (!findUserId) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.NOT_FOUND_USER"),
        );
      }

      let legalByOwnerId = await Legal.findOneBy({ ownerId: findUserId });
      if (legalByOwnerId) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.OWNER_ALREADY_HAS_LEGAL"),
        );
      }
      id = findUserId;
    }

    const legal: Legal = Legal.create<Legal>(createLegalInput);
    legal.ownerId = id;
    legal.createdById = user.id;

    const member = new Member();
    member.relatedId = legal.id;
    member.userId = user.id;
    // member.adminId = userId
    member.position = "مدیرعامل";

    const memberExists = await Member.findOneBy({ userId: id });
    if (memberExists) {
      throw new BadRequestException(
        await this.i18n.translate("exceptions.MEMBER_ALREADY_EXISTS"),
      );
    }

    await member.save();
    await legal.save();
    return legal;
  }

  async update(
    id: number,
    updateLegalInput: UpdateLegalInput,
    user: User,
  ): Promise<Legal> {
    if (updateLegalInput.name_company) {
      updateLegalInput.name_company = updateLegalInput?.name_company
        ?.replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        ?.trim();
    }

    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException("Legal entity not found");
    }

    await this.checkLegalExists(
      updateLegalInput.national_id,
      updateLegalInput.name_company,
      legal.id,
    );

    const isAdmin = await this.authorizationService
      .setUser(user)
      .hasRole("admin");

    if (!isAdmin) {
      updateLegalInput.cellphone ? delete updateLegalInput.cellphone : null;
      updateLegalInput.status ? delete updateLegalInput.status : null;
      updateLegalInput.wallet ? delete updateLegalInput.wallet : null;
    }

    let user_id = user.id;

    if (updateLegalInput.cellphone && isAdmin) {
      let user_id = (
        await await User.findOneBy({ cellphone: updateLegalInput.cellphone })
      ).id;
      if (!user_id) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.NOT_FOUND_USER"),
        );
      }

      let legalByOwnerId: Legal = await Legal.findOneBy({ ownerId: user_id });

      if (legalByOwnerId && legal.id !== legalByOwnerId.id) {
        throw new BadRequestException(
          await this.i18n.translate("exceptions.OWNER_ALREADY_HAS_LEGAL"),
        );
      }
    }

    Object.assign(legal, updateLegalInput);

    legal.createdById = user_id;

    const hasOwner = await legal.owner;
    const hasFinantial = legal.shabaNumber && legal.accountNumber;
    const hasAddresses = legal.addresses && (await legal.addresses).length > 0;
    const hasContacts = legal.contacts && (await legal.contacts).length > 0;
    const hasMembers = legal.members && (await legal.members).length > 0;

    const updateCurrentStatesByCommingProps = {
      [LegalStateEnum.PENDING_OWNER]: hasOwner
        ? LegalStateEnum.PENDING_FINANTIAL
        : LegalStateEnum.PENDING_OWNER,
      [LegalStateEnum.PENDING_FINANTIAL]: hasFinantial
        ? LegalStateEnum.PENDING_ADDRESS
        : LegalStateEnum.PENDING_FINANTIAL,
      [LegalStateEnum.PENDING_ADDRESS]: hasAddresses
        ? LegalStateEnum.PENDING_CONTACT
        : LegalStateEnum.PENDING_ADDRESS,
      [LegalStateEnum.PENDING_CONTACT]: hasContacts
        ? LegalStateEnum.PENDING_MEMBER
        : LegalStateEnum.PENDING_CONTACT,
      [LegalStateEnum.PENDING_MEMBER]: hasMembers
        ? LegalStateEnum.FULL
        : LegalStateEnum.PENDING_MEMBER,
      [LegalStateEnum.FULL]: LegalStateEnum.FULL,
    };

    legal.state = updateCurrentStatesByCommingProps[legal.state];

    await legal.save();
    return legal;
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const legal = await Legal.findOneBy({ id });
    if (!legal) {
      throw new NotFoundException("Legal entity not found");
    }

    await Member.delete({ relatedId: legal.id });
    await legal.remove();
    return true;
  }

  async findAll(
    indexLegalInput: IndexLegalInput,
  ): Promise<PaginationLegalResponse> {
    indexLegalInput.boot();
    const { take, skip, nameOrUuid, national_id, ownerName } =
      indexLegalInput || {};
    const whereConditions: any = {};

    if (nameOrUuid) {
      whereConditions["name_company"] = Like(`%${nameOrUuid}%`);
    }

    if (national_id) {
      whereConditions["national_id"] = Like(`%${national_id}%`);
    }

    if (ownerName) {
      whereConditions["owner"] = [
        { firstName: Like(`%${ownerName}%`) },
        { lastName: Like(`%${ownerName}%`) },
      ];
    }

    const [data, total] = await Legal.findAndCount({
      where: whereConditions,
      take,
      skip,
      order: {
        id: "DESC",
      },
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
      order: {
        sort: "ASC",
      },
    });

    const membersPromise = Member.find({
      where: {
        type: TypeMember.LEGAL,
        relatedId: id,
      },
    });

    const [legal, contacts, addresses, members] = await Promise.all([
      legalPromise,
      contactsPromise,
      addressesPromise,
      membersPromise,
    ]);

    if (!legal) {
      throw new NotFoundException("Legal entity not found");
    }
    legal.contacts = contacts;
    legal.members = members;
    legal.addresses = addresses;

    return legal;
  }
}
