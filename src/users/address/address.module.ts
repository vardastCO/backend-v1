import { Module } from "@nestjs/common";
import { AddressService } from "./address.service";
import { AddressResolver } from "./address.resolver";
import AddressSeeder from "./address.seed";

@Module({
  providers: [AddressResolver, AddressService, AddressSeeder],
})
export class AddressModule {}
