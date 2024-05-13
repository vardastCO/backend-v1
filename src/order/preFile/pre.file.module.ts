import { Module } from '@nestjs/common';
import { PreFileService } from './pre-file.service';
import { PreFileResolver } from './pre-file.resolver';

@Module({
  providers: [
    PreFileService,
    PreFileResolver,
  ]
})
export class PreFileModule {}
