import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { PriceResolver } from "./price.resolver";

@Module({
  providers: [PriceResolver, PriceService],
})
export class PriceModule {}
