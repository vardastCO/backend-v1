import { Module } from "@nestjs/common";
import { SeedCommand } from "./seed.command";
import { IsUnique } from "./validations/is-unique.validation";
import { PaginationModule } from './pagination/pagination.module';

@Module({
  providers: [SeedCommand, IsUnique],
  imports: [PaginationModule],
})
export class UtilitiesModule {}
