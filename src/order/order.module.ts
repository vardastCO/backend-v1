import { Module } from '@nestjs/common';
import { PreFileModule } from './preFile/pre.file.module';
import { PreOrderModule } from './preOrder/pre.order.module';
import { PreOrderLineModule } from './line/pre-order-line.module';
import { OrderOfferModule } from './orderOffer/orderOffer.module';

@Module({
  imports:[
    PreOrderModule,
    PreFileModule,
    PreOrderLineModule,
    OrderOfferModule
  ],

})
export class OrderModule {}
