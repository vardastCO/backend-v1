import { Module } from '@nestjs/common';
import { PreFileModule } from './preFile/pre.file.module';
import { PreOrderModule } from './preOrder/pre.order.module';
import { PreOrderLineModule } from './line/pre-order-line.module';

@Module({
  imports:[
    PreOrderModule,
    PreFileModule,
    PreOrderLineModule
  ],

})
export class OrderModule {}
