import { Module } from '@nestjs/common';
import { PowerTaxValueService } from './power-tax-value.service';
import { PowerTaxValueController } from './power-tax-value.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PowerTaxValue } from './entities/power-tax-value.entity';

@Module({
  imports: [SequelizeModule.forFeature([PowerTaxValue])],
  controllers: [PowerTaxValueController],
  providers: [PowerTaxValueService],
})
export class PowerTaxValueModule {}
