import { Module } from "@nestjs/common";
import { AuthorizationModule } from "src/users/authorization/authorization.module";
import { UserModule } from "src/users/user/user.module";
import { OfferResolver } from "./offer.resolver";
import { OfferService } from "./offer.service";

@Module({
  imports: [AuthorizationModule, UserModule],
  providers: [OfferResolver, OfferService],
})
export class OfferModule {}
