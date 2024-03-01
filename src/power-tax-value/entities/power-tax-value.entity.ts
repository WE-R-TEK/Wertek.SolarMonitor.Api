import { Table, Model, Column } from 'sequelize-typescript';

@Table({
  tableName: 'power_tax_value',
})
export class PowerTaxValue extends Model {
  @Column
  user: string;

  @Column
  year: number;

  @Column
  month: number;

  @Column
  date: Date;

  @Column
  tusd_fornecida: number;

  @Column
  te_fornecida: number;

  @Column
  tusd_injetada: number;

  @Column
  te_injetada: number;
}
