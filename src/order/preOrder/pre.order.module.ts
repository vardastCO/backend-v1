import { Module } from '@nestjs/common';
import { PreOrderService } from './pre-order.service';
import { PreOrderResolver } from './pre-order.resolver';
@Module({
  providers: [
    PreOrderService,
    PreOrderResolver,
  ]
})
export class PreOrderModule {}
