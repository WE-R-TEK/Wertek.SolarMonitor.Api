import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { database } from './firebase';
import { get, ref, set } from 'firebase/database';
import * as moment from 'moment-timezone';
import { PowerData } from './models/power-data/power-data.class';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async test(@Body() data: any) {
    const momentum = moment().tz('America/Sao_Paulo');
    const year = momentum.format('YYYY');
    const month = momentum.format('YYYY-MM');
    const day = momentum.format('YYYY-MM-DD');
    const hour = momentum.format('YYYY-MM-DD HH:mm:ss');
    const dataF = new PowerData(data);

    // CALCULA KWH
    dataF.kwhAPer = (dataF.pa / 1000) * (30 / 60 / 60);
    dataF.kwhBPer = (dataF.pb / 1000) * (30 / 60 / 60);
    dataF.kwhCPer = (dataF.pc / 1000) * (30 / 60 / 60);
    dataF.kwhTPer = (dataF.pt / 1000) * (30 / 60 / 60);

    const lastSum = await get(
      ref(database, `user_identity/${year}/${month}/${day}/sum`),
    );
    if (lastSum.exists()) {
      dataF.kwhAConAcum =
        dataF.kwhAPer >= 0
          ? lastSum.val().kwhAConAcum + dataF.kwhAPer
          : lastSum.val().kwhAConAcum;
      dataF.kwhBConAcum =
        dataF.kwhBPer >= 0
          ? lastSum.val().kwhBConAcum + dataF.kwhBPer
          : lastSum.val().kwhBConAcum;
      dataF.kwhCConAcum =
        dataF.kwhCPer >= 0
          ? lastSum.val().kwhCConAcum + dataF.kwhCPer
          : lastSum.val().kwhCConAcum;
      dataF.kwhTConAcum =
        dataF.kwhTPer >= 0
          ? lastSum.val().kwhTConAcum + dataF.kwhTPer
          : lastSum.val().kwhTConAcum;
      dataF.kwhAGerAcum =
        dataF.kwhAPer < 0
          ? lastSum.val().kwhAGerAcum + dataF.kwhAPer * -1
          : lastSum.val().kwhAGerAcum;
      dataF.kwhBGerAcum =
        dataF.kwhBPer < 0
          ? lastSum.val().kwhBGerAcum + dataF.kwhBPer * -1
          : lastSum.val().kwhBGerAcum;
      dataF.kwhCGerAcum =
        dataF.kwhCPer < 0
          ? lastSum.val().kwhCGerAcum + dataF.kwhCPer * -1
          : lastSum.val().kwhCGerAcum;
      dataF.kwhTGerAcum =
        dataF.kwhTPer < 0
          ? lastSum.val().kwhTGerAcum + dataF.kwhTPer * -1
          : lastSum.val().kwhTGerAcum;
    } else {
      dataF.kwhAConAcum = dataF.kwhAPer >= 0 ? dataF.kwhAPer : 0;
      dataF.kwhBConAcum = dataF.kwhBPer >= 0 ? dataF.kwhBPer : 0;
      dataF.kwhCConAcum = dataF.kwhCPer >= 0 ? dataF.kwhCPer : 0;
      dataF.kwhTConAcum = dataF.kwhTPer >= 0 ? dataF.kwhTPer : 0;
      dataF.kwhAGerAcum = dataF.kwhAPer < 0 ? dataF.kwhAPer * -1 : 0;
      dataF.kwhBGerAcum = dataF.kwhBPer < 0 ? dataF.kwhBPer * -1 : 0;
      dataF.kwhCGerAcum = dataF.kwhCPer < 0 ? dataF.kwhCPer * -1 : 0;
      dataF.kwhTGerAcum = dataF.kwhTPer < 0 ? dataF.kwhTPer * -1 : 0;
    }

    set(ref(database, `user_identity/${year}/${month}/${day}/${hour}`), dataF);
    set(ref(database, 'user_identity/now'), dataF);

    // UPDATE UPPER LEVEL WITH SUM OF ALL DATA
    this.updateParentSum(`user_identity/${year}/${month}/${day}/sum`, dataF);
    this.updateParentSum(`user_identity/${year}/${month}/sum`, dataF);
    this.updateParentSum(`user_identity/${year}/sum`, dataF);
  }

  private async updateParentSum(sumPath: string, dataF: PowerData) {
    get(ref(database, sumPath)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        data.kwhAConAcum += dataF.kwhAConAcum;
        data.kwhBConAcum += dataF.kwhBConAcum;
        data.kwhCConAcum += dataF.kwhCConAcum;
        data.kwhTConAcum += dataF.kwhTConAcum;
        data.kwhAGerAcum += dataF.kwhAGerAcum;
        data.kwhBGerAcum += dataF.kwhBGerAcum;
        data.kwhCGerAcum += dataF.kwhCGerAcum;
        data.kwhTGerAcum += dataF.kwhTGerAcum;
        set(ref(database, sumPath), data);
      } else {
        set(ref(database, sumPath), {
          kwhAConAcum: dataF.kwhAConAcum,
          kwhBConAcum: dataF.kwhBConAcum,
          kwhCConAcum: dataF.kwhCConAcum,
          kwhTConAcum: dataF.kwhTConAcum,
          kwhAGerAcum: dataF.kwhAGerAcum,
          kwhBGerAcum: dataF.kwhBGerAcum,
          kwhCGerAcum: dataF.kwhCGerAcum,
          kwhTGerAcum: dataF.kwhTGerAcum,
        });
      }
    });
  }
}
