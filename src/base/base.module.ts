import { Module } from "@nestjs/common";
import { EventTrackerModule } from "./event-tracker/event-tracker.module";
import { LocationModule } from "./location/location.module";
import { SearchModule } from "./search/search.module";
import { StorageModule } from "./storage/storage.module";
import { TaxonomyModule } from "./taxonomy/taxonomy.module";
import { UtilitiesModule } from "./utilities/utilities.module";
import { KavenegarModule } from './kavenegar/kavenegar.module';
import { BlogModule } from "./blog/blog.module";
import { FaqModule } from "./faq/faq.module";



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
    FaqModule
  ],
})
export class BaseModule {}
