import { Module } from "@nestjs/common";
import { OrderOfferResolver } from "./orderOffer.resolver";
import { OrderOfferService } from "./orderOffer.service";

@Module({
  providers: [OrderOfferResolver, OrderOfferService],
})
export class OrderOfferModule {}
