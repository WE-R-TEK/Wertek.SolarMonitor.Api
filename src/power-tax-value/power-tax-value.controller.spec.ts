import { Test, TestingModule } from '@nestjs/testing';
import { PowerTaxValueController } from './power-tax-value.controller';
import { PowerTaxValueService } from './power-tax-value.service';

describe('PowerTaxValueController', () => {
  let controller: PowerTaxValueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerTaxValueController],
      providers: [PowerTaxValueService],
    }).compile();

    controller = module.get<PowerTaxValueController>(PowerTaxValueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
