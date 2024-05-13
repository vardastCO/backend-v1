import { Module } from '@nestjs/common';
import { PreOrderLineService } from './pre-order-line.service';
import { PreOrderLineResolver } from './pre-order-line.resolver';

@Module({
  providers: [
    PreOrderLineService,
    PreOrderLineResolver,
  ]
})
export class PreOrderLineModule {}
