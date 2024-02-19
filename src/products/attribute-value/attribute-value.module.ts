import { Module } from '@nestjs/common';
import { AttributeValueService } from './attribute-value.service';
import { AttributeValueResolver } from './attribute-value.resolver';

@Module({
  providers: [AttributeValueResolver, AttributeValueService]
})
export class AttributeValueModule {}
