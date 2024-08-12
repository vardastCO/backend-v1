import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/entities/user.entity";
import { CreateContactInfoInput } from "./dto/create-contact-info.input";
import { IndexContactInfoInput } from "./dto/index-contact-info.input";
import { PaginationContactInfoResponse } from "./dto/pagination-contact-info.response";
import { UpdateContactInfoInput } from "./dto/update-contact-info.input";
import { ContactInfo } from "./entities/contact-info.entity";
import { Country } from "src/base/location/country/entities/country.entity";

@Injectable()
export class ContactInfoService {
  async create(
    createContactInfoInput: CreateContactInfoInput,
  ): Promise<ContactInfo> {
    const contact: ContactInfo = ContactInfo.create<ContactInfo>(
      createContactInfoInput,
    );
    
    await contact.save();
    return contact;
  }

  async findAll(
    indexContactInfoInput?: IndexContactInfoInput,
  ): Promise<ContactInfo[]> {
    indexContactInfoInput.boot();
    const { take, skip } = indexContactInfoInput || {};
    return await ContactInfo.find({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexContactInfoInput?: IndexContactInfoInput,
  ): Promise<PaginationContactInfoResponse> {
    indexContactInfoInput.boot();
    const { take, skip } = indexContactInfoInput || {};
    const [data, total] = await ContactInfo.findAndCount({
      skip,
      take,
      where: {},
      order: { id: "DESC" },
    });

    return PaginationContactInfoResponse.make(
      indexContactInfoInput,
      total,
      data,
    );
  }

  async findOne(id: number): Promise<ContactInfo> {
    const contact = await ContactInfo.findOneBy({ id });
    if (!contact) {
      throw new NotFoundException();
    }
    return contact;
  }

  async update(
    id: number,
    updateContactInfoInput: UpdateContactInfoInput,
    user: User,
  ): Promise<ContactInfo> {
    const contact: ContactInfo = await ContactInfo.preload({
      id,
      ...updateContactInfoInput,
    });
    if (!contact) {
      throw new NotFoundException();
    }

    contact.admin = Promise.resolve(user);

    await contact.save();
    return contact;
  }

  async remove(id: number): Promise<ContactInfo> {
    const contact: ContactInfo = await this.findOne(id);
    await contact.remove();
    contact.id = id;
    return contact;
  }

  async getCountryOf(contact: ContactInfo): Promise<Country> {
    return ;
  }

  async getAdminOf(contact: ContactInfo): Promise<User> {
    return await contact.admin;
  }
}
