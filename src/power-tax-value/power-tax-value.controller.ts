import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PowerTaxValueService } from './power-tax-value.service';
import { CreatePowerTaxValueDto } from './dto/create-power-tax-value.dto';
import { UpdatePowerTaxValueDto } from './dto/update-power-tax-value.dto';

@Controller('power-tax-value')
export class PowerTaxValueController {
  constructor(private readonly powerTaxValueService: PowerTaxValueService) {}

  @Post()
  create(@Body() createPowerTaxValueDto: CreatePowerTaxValueDto) {
    return this.powerTaxValueService.create(createPowerTaxValueDto);
  }

  @Get()
  findAll() {
    return this.powerTaxValueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.powerTaxValueService.findOne(+id);
  }

  @Get('year/:year/month/:month')
  findByMonthAndYear(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    console.log('year', year, 'month', month);
    return this.powerTaxValueService.findByMonthAndYear(year, month);
  }

  @Post('year/:year/month/:month')
  updateByMonthAndYear(
    @Param('year') year: number,
    @Param('month') month: number,
    @Body() updatePowerTaxValueDto: UpdatePowerTaxValueDto,
  ) {
    const powerTaxValue = this.powerTaxValueService.findByMonthAndYear(
      year,
      month,
    );
    return this.powerTaxValueService.updateOrInsert({
      ...updatePowerTaxValueDto,
      year,
      month,
      id: powerTaxValue['id'],
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePowerTaxValueDto: UpdatePowerTaxValueDto,
  ) {
    return this.powerTaxValueService.update(+id, updatePowerTaxValueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.powerTaxValueService.remove(+id);
  }
}
