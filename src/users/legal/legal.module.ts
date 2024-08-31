import { Module } from "@nestjs/common";
import { LegalResolver } from "./legal.resolver";
import { LegalService } from "./legal.service";

@Module({
  providers: [LegalResolver, LegalService],
})
export class LegalModule {}
