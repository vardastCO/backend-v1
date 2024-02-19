// faq

import { Module } from "@nestjs/common";

import {FaqService} from "./faq.service"
import { FaqResolver } from "./faq.resolver"

@Module({
    providers: [FaqService, FaqResolver]
})

export class FaqModule { };