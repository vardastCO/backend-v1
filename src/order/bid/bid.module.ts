import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidResolver } from './bid.resolver';
@Module({
  providers: [
    BidService,
    BidResolver,
  ]
})
export class BidModule {}
