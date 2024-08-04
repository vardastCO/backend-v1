import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateContactInput } from "./dto/create-contact.input";
import { IndexContactInput } from "./dto/IndexContactInput";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { ContactUs } from "./entities/Contact.entity";

@Injectable()
export class ContactUsService {

    constructor(
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
}

