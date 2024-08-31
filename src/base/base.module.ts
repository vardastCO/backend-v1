import { Module } from "@nestjs/common";
import { BlogModule } from "./blog/blog.module";
import { ContactUsModule } from "./contactus/contactus.module";
import { EventTrackerModule } from "./event-tracker/event-tracker.module";
import { FaqModule } from "./faq/faq.module";
import { KavenegarModule } from "./kavenegar/kavenegar.module";
import { LocationModule } from "./location/location.module";
import { SearchModule } from "./search/search.module";
import { StorageModule } from "./storage/storage.module";
import { TaxonomyModule } from "./taxonomy/taxonomy.module";
import { UtilitiesModule } from "./utilities/utilities.module";

@Module({
  imports: [
    LocationModule,
    TaxonomyModule,
    UtilitiesModule,
    StorageModule,
    SearchModule,
    EventTrackerModule,
    KavenegarModule,
    BlogModule,
    FaqModule,
    ContactUsModule,
  ],
})
export class BaseModule {}
