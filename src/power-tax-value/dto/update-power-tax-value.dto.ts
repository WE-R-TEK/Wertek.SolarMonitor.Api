import { PartialType } from '@nestjs/mapped-types';
import { CreatePowerTaxValueDto } from './create-power-tax-value.dto';

export class UpdatePowerTaxValueDto extends PartialType(
  CreatePowerTaxValueDto,
) {}
