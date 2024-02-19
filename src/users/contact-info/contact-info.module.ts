import { Module } from "@nestjs/common";
import { ContactInfoResolver } from "./contact-info.resolver";
import ContactInfoSeeder from "./contact-info.seed";
import { ContactInfoService } from "./contact-info.service";

@Module({
  providers: [ContactInfoResolver, ContactInfoService, ContactInfoSeeder],
})
export class ContactInfoModule {}
