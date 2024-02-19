import { Test, TestingModule } from '@nestjs/testing';
import { PriceResolver } from './price.resolver';
import { PriceService } from './price.service';

describe('PriceResolver', () => {
  let resolver: PriceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceResolver, PriceService],
    }).compile();

    resolver = module.get<PriceResolver>(PriceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
