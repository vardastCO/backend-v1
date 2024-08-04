import { ValidationPipe } from "@nestjs/common";
import {
    Args,
    Int,
    Mutation,
    Query,
    Resolver
} from "@nestjs/graphql";
import { Public } from "src/users/auth/decorators/public.decorator";

import { CreateContactInput } from "./dto/create-contact.input";
import { IndexContactInput } from "./dto/IndexContactInput";
import { PaginationContactUsResponse } from "./dto/PaginationContactUsResponse";
import { ContactUs } from './entities/Contact.entity';
import { ContactUsService } from "./contactus.service";

@Resolver(() => ContactUs)
export class ContactResolver {
    constructor(private readonly contactUsService: ContactUsService) { }


    @Public()
    @Query(() => ContactUs, { name: "findOneContactUs" })
    findOneContactUs(@Args("id", { type: () => Int}) id: number){
        return this.contactUsService.findOneContactUs(id)
    }

    @Public()
    @Query(() => PaginationContactUsResponse, { name: "getAllContactUs" })
    getAllContactUs(
        @Args(
            "indexContactInput",
            { nullable: true },
            new ValidationPipe({ transform: true }),
          )
          indexContactInput?: IndexContactInput,
    ) {
        return this.contactUsService.getAllContactUs(indexContactInput);
    }


    @Public()
    @Mutation(() => ContactUs)
    createContactUs(@Args("createContactInput") createContactInput: CreateContactInput){
        return this.contactUsService.createContactUs(createContactInput);
    }

}

