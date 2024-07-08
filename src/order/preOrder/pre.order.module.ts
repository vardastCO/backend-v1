import { Module } from '@nestjs/common';
import { PreOrderService } from './pre-order.service';
import { PreOrderResolver } from './pre-order.resolver';
import { DecompressionService } from 'src/decompression.service';
import { CompressionService } from 'src/compression.service';
@Module({
  providers: [
    PreOrderService,
    PreOrderResolver,
    CompressionService,
    DecompressionService,
  ]
})
export class PreOrderModule {}
