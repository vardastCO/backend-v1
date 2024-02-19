import { Module } from '@nestjs/common';
import { UomService } from './uom.service';
import { UomResolver } from './uom.resolver';

@Module({
  providers: [UomResolver, UomService]
})
export class UomModule {}
