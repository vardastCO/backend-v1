import { Module } from "@nestjs/common";
import { AttributeValueModule } from "./attribute-value/attribute-value.module";
import { AttributeModule } from "./attribute/attribute.module";
import { BrandModule } from "./brand/brand.module";
import { ImagesModule } from "./images/images.module";
import { PriceModule } from "./price/price.module";
import { ProductModule } from "./product/product.module";
import { UomModule } from "./uom/uom.module";
import { SellerModule } from "./seller/seller.module";
import { OfferModule } from "./offer/offer.module";
import { OptionsModule } from "./options/options.module";

@Module({
  imports: [
    ProductModule,
    BrandModule,
    AttributeModule,
    PriceModule,
    UomModule,
    AttributeValueModule,
    ImagesModule,
    SellerModule,
    OfferModule,
    OptionsModule,
  ],
})
export class ProductsModule {}
