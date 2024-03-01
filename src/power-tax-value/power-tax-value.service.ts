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

  async findByMonthAndYear(year: number, month: number) {
    let monthData = await this.powerTaxValueRepository.findOne({
      where: { month, year },
    });
    if (!monthData) {
      const { prevYear, prevMonth } = this.getPreviousMonth(year, month);
      monthData = await this.powerTaxValueRepository.findOne({
        where: { month: prevMonth, year: prevYear },
      });
      if (monthData) {
        await this.create({
          tusd_fornecida: monthData.tusd_fornecida,
          te_fornecida: monthData.te_fornecida,
          tusd_injetada: monthData.tusd_injetada,
          te_injetada: monthData.te_injetada,
          month,
          year,
          id: null,
        });
      }
    }
    return monthData;
  }

  private getPreviousMonth(
    year: number,
    month: number,
  ): { prevMonth: number; prevYear: number } {
    // Criar uma nova data com o primeiro dia do mês especificado
    // Lembre-se de subtrair 1 de month, pois Date usa meses baseados em 0
    const date = new Date(year, month - 1, 1);

    // Subtrair um dia para ir para o mês anterior
    date.setDate(date.getDate() - 1);

    // Obter o mês e ano do mês anterior
    const prevMonth = date.getMonth() + 1; // Adiciona 1 para compensar meses baseados em 0
    const prevYear = date.getFullYear();

    return { prevMonth, prevYear };
  }

  updateOrInsert(updatePowerTaxValueDto: UpdatePowerTaxValueDto) {
    return this.powerTaxValueRepository.upsert(updatePowerTaxValueDto as any);
  }
}
