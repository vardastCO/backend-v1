import { Injectable, NotFoundException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { CreateContactInput } from "./dto/create-contact.input";
import { IndexContactInput } from "./dto/IndexContactInput";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { UpdateContactUsInput } from "./dto/update-member.input";
import { ContactUs } from "./entities/Contact.entity";
import { File } from "../storage/file/entities/file.entity";
import { User } from "src/users/user/entities/user.entity";

@Injectable()
export class ContactUsService {
  constructor(@I18n() protected readonly i18n: I18nService) {}

  // CRUD
  async createContactUs(
    createContactInput: CreateContactInput,
    user: User,
  ): Promise<ContactUs> {
    try {
      const cotactUs = await ContactUs.findOneBy({
        userId: user.id,
      });
      if (!cotactUs) {
        throw new NotFoundException("user sent contact us before.");
      }

      const { fullname, title, cellphone, text, fileuuid } = createContactInput;
      let file = null;
      if (fileuuid) {
        file = await File.findOneBy({ uuid: fileuuid });
      }

      const contact_us = new ContactUs();
      contact_us.fullname = fullname;
      contact_us.title = title;
      contact_us.cellphone = cellphone;
      contact_us.text = text;
      contact_us.file = file ? Promise.resolve(file) : null;
      contact_us.userId = user.id ?? null;

      await contact_us.save();
      return contact_us;
    } catch (e) {
      console.log("err in createContactUs ", e);
    }
  }

  async findOneContactUs(id: number): Promise<ContactUs> {
    const faq: ContactUs = await ContactUs.findOneBy({ id: id });
    if (!faq) {
      throw new NotFoundException();
    }

    return faq;
  }

  async getAllContactUs(
    indexContactInput?: IndexContactInput,
  ): Promise<PaginationContactUsResponse> {
    try {
      indexContactInput.boot();
      const [result, total] = await ContactUs.findAndCount({
        take: indexContactInput.take,
        skip: indexContactInput.skip,
        order: {
          id: "DESC",
        },
      });

      const res = PaginationContactUsResponse.make(
        indexContactInput,
        total,
        result,
      );
      return res;
    } catch (e) {
      console.log("err", e);
    }
  }

  async updateContactUs(
    id: number,
    updateContactUs: UpdateContactUsInput,
  ): Promise<ContactUs> {
    const cotactUs = await ContactUs.preload({ id, ...updateContactUs });
    if (!cotactUs) {
      throw new NotFoundException("Contact Us Not Found.");
    }
    if (updateContactUs.fileuuid) {
      const file = await File.findOneBy({ uuid: updateContactUs.fileuuid });
      cotactUs.file = file ? Promise.resolve(file) : null;
    }

    await cotactUs.save();
    return cotactUs;
  }

  async removeContactUs(id: number): Promise<Boolean> {
    const contactUs: ContactUs = await ContactUs.findOneBy({ id });
    if (!contactUs) {
      throw new NotFoundException("Contact Us Not Found.");
    }

    await contactUs.remove();
    return true;
  }
}
