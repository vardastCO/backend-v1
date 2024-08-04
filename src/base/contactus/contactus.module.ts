// contact us

import { Module } from "@nestjs/common";
import {ContactUsService} from "./contactus.service"
import { ContactResolver } from "./contactus.resolver"


@Module({
    providers: [
        ContactUsService,
        ContactResolver
    ]
})

export class ContactUsModule { };