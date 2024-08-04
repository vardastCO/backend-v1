import { Injectable, NotFoundException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { CreateContactInput } from "./dto/create-contact.input";
import { IndexContactInput } from "./dto/IndexContactInput";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { UpdateContactUsInput } from "./dto/update-member.input";
import { ContactUs } from "./entities/Contact.entity";

@Injectable()
export class ContactUsService {

    constructor(
        @I18n() protected readonly i18n: I18nService
    ) {}
    
    // CRUD
    async createContactUs(createContactInput: CreateContactInput): Promise<ContactUs> {
        try{
            
            const { fullname, title,cellphone,text,fileId } = createContactInput;

            const things     = new ContactUs()
            things.fullname  = fullname
            things.title     = title
            things.cellphone = cellphone
            things.text      = text
            things.fileId    = fileId ?? null
    
            await things.save()
            return things
        }catch(e){
         console.log('err in createContactUs ',e)
        }
       
    }

    async findOneContactUs(id: number): Promise<ContactUs> {
        const faq: ContactUs = await ContactUs.findOneBy({ id: id })
        if (!faq) {
            throw new NotFoundException();
        }

        return faq;
    }

    async getAllContactUs( indexContactInput?: IndexContactInput): Promise<PaginationContactUsResponse> {
        try{
            indexContactInput.boot()
            const [result, total] = await ContactUs.findAndCount({
                take:indexContactInput.take,
                skip:indexContactInput.skip,
                order : {
                    id:'DESC'
                }
              });
    
            const res = PaginationContactUsResponse.make(indexContactInput,total, result);
            return res;
        }catch(e){
          console.log('err',e)
        }
       

    }

    async updateContactUs(id: number, updateContactUs: UpdateContactUsInput): Promise<ContactUs>{
        const cotactUs = await ContactUs.preload({id, ...updateContactUs});
        if (!cotactUs) {
            throw new NotFoundException("Contact Us Not Found.");
        }

        await cotactUs.save();
        return cotactUs;
    }

    async removeContactUs(id: number): Promise<Boolean>{
        const contactUs: ContactUs = await ContactUs.findOneBy({ id });
        if (!contactUs) {
            throw new NotFoundException('Contact Us Not Found.');
        }

        await contactUs.remove();
        return true;
    }
}

