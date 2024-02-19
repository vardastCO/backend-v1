// blog.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { FAQ } from "./entities/faq.entity";
import { UpdateFaqInput } from "./dto/update-faq.input"
import { CreateFaqInput } from "./dto/create-faq.input"

@Injectable()
export class FaqService {
    
    // CRUD
    async createFaq(createFaqInput: CreateFaqInput): Promise<FAQ> {
        const { answer, question } = createFaqInput;

        if (createFaqInput && createFaqInput) {
            const existFaq = await FAQ.findOneBy({
                question,
                answer
            })

            if (existFaq) {
                return existFaq;
            }

            const faq: FAQ = FAQ.create({ question, answer })
            await faq.save();
            return faq
        }
    }

    async findOne(id: number): Promise<FAQ> {
        const faq: FAQ = await FAQ.findOneBy({ id: id })
        if (!faq) {
            throw new NotFoundException();
        }
        return faq;
    }

    async update(id: number, updateFaqInput: UpdateFaqInput): Promise<FAQ> {
        const faq: FAQ = await FAQ.findOneBy({ id: id });
        if (!faq) {
            throw new NotFoundException();
        }
        
        faq.answer = updateFaqInput.answer;
        faq.question = updateFaqInput.question;
        await faq.save()

        return faq;
    }

    async remove(id: number): Promise<FAQ>{
        const faq: FAQ = await FAQ.findOneBy({ id: id });
        if (!faq) {
            throw new NotFoundException();
        }
        await faq.remove();
        faq.id = id;
        return faq;
    }

    async getAllFaqs(): Promise<FAQ[]> {
        const faqs: FAQ[] = await FAQ.find({});
        return faqs;
    }
}

