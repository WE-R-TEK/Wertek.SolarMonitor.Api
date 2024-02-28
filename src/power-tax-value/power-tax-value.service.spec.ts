import { Test, TestingModule } from '@nestjs/testing';
import { PowerTaxValueService } from './power-tax-value.service';

describe('PowerTaxValueService', () => {
  let service: PowerTaxValueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerTaxValueService],
    }).compile();

    service = module.get<PowerTaxValueService>(PowerTaxValueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
