import { Injectable } from '@nestjs/common';
import { CreatePowerTaxValueDto } from './dto/create-power-tax-value.dto';
import { UpdatePowerTaxValueDto } from './dto/update-power-tax-value.dto';
import { InjectModel } from '@nestjs/sequelize';
import { PowerTaxValue } from './entities/power-tax-value.entity';

@Injectable()
export class PowerTaxValueService {
  constructor(
    @InjectModel(PowerTaxValue)
    private powerTaxValueRepository: typeof PowerTaxValue,
  ) {}

  create(createPowerTaxValueDto: CreatePowerTaxValueDto) {
    return this.powerTaxValueRepository.create(createPowerTaxValueDto as any);
  }

  findAll() {
    return this.powerTaxValueRepository.findAll();
  }

  findOne(id: number) {
    return this.powerTaxValueRepository.findByPk(id);
  }

  update(id: number, updatePowerTaxValueDto: UpdatePowerTaxValueDto) {
    return this.powerTaxValueRepository.update(updatePowerTaxValueDto as any, {
      where: { id },
    });
  }

  remove(id: number) {
    return this.powerTaxValueRepository.destroy({ where: { id } });
  }
}
