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

    const lastSum = await get(
      ref(database, `user_identity/${year}/${month}/${day}/sum`),
    );
    if (lastSum.exists()) {
      dataF.kwhAPer = dataF.epa_c - lastSum.val().epa_c;
      dataF.kwhBPer = dataF.epb_c - lastSum.val().epb_c;
      dataF.kwhCPer = dataF.epc_c - lastSum.val().epc_c;
      dataF.kwhTPer = dataF.ept_c - lastSum.val().ept_c;
      dataF.kwhAGerPer = dataF.epa_g - lastSum.val().epa_g;
      dataF.kwhBGerPer = dataF.epb_g - lastSum.val().epb_g;
      dataF.kwhCGerPer = dataF.epc_g - lastSum.val().epc_g;
      dataF.kwhTGerPer = dataF.ept_g - lastSum.val().ept_g;
      dataF.kwhAConAcum = lastSum.val().kwhAConAcum + dataF.kwhAPer;
      dataF.kwhBConAcum = lastSum.val().kwhBConAcum + dataF.kwhBPer;
      dataF.kwhCConAcum = lastSum.val().kwhCConAcum + dataF.kwhCPer;
      dataF.kwhTConAcum = lastSum.val().kwhTConAcum + dataF.kwhTPer;
      dataF.kwhAGerAcum = lastSum.val().kwhAGerAcum + dataF.kwhAGerPer;
      dataF.kwhBGerAcum = lastSum.val().kwhBGerAcum + dataF.kwhBGerPer;
      dataF.kwhCGerAcum = lastSum.val().kwhCGerAcum + dataF.kwhCGerPer;
      dataF.kwhTGerAcum = lastSum.val().kwhTGerAcum + dataF.kwhTGerPer;
    } else {
      dataF.kwhAPer = 0;
      dataF.kwhBPer = 0;
      dataF.kwhCPer = 0;
      dataF.kwhTPer = 0;
      dataF.kwhAGerPer = 0;
      dataF.kwhBGerPer = 0;
      dataF.kwhCGerPer = 0;
      dataF.kwhTGerPer = 0;
      dataF.kwhAConAcum = 0;
      dataF.kwhBConAcum = 0;
      dataF.kwhCConAcum = 0;
      dataF.kwhTConAcum = 0;
      dataF.kwhAGerAcum = 0;
      dataF.kwhBGerAcum = 0;
      dataF.kwhCGerAcum = 0;
      dataF.kwhTGerAcum = 0;
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
        data.epa_c = dataF.epa_c;
        data.epb_c = dataF.epb_c;
        data.epc_c = dataF.epc_c;
        data.ept_c = dataF.ept_c;
        data.epa_g = dataF.epa_g;
        data.epb_g = dataF.epb_g;
        data.epc_g = dataF.epc_g;
        data.ept_g = dataF.ept_g;
        data.kwhAConAcum += dataF.kwhAPer;
        data.kwhBConAcum += dataF.kwhBPer;
        data.kwhCConAcum += dataF.kwhCPer;
        data.kwhTConAcum += dataF.kwhTPer;
        data.kwhAGerAcum += dataF.kwhAGerPer;
        data.kwhBGerAcum += dataF.kwhBGerPer;
        data.kwhCGerAcum += dataF.kwhCGerPer;
        data.kwhTGerAcum += dataF.kwhTGerPer;
        set(ref(database, sumPath), data);
      } else {
        set(ref(database, sumPath), {
          epa_c: dataF.epa_c,
          epb_c: dataF.epb_c,
          epc_c: dataF.epc_c,
          ept_c: dataF.ept_c,
          epa_g: dataF.epa_g,
          epb_g: dataF.epb_g,
          epc_g: dataF.epc_g,
          ept_g: dataF.ept_g,
          kwhAConAcum: 0,
          kwhBConAcum: 0,
          kwhCConAcum: 0,
          kwhTConAcum: 0,
          kwhAGerAcum: 0,
          kwhBGerAcum: 0,
          kwhCGerAcum: 0,
          kwhTGerAcum: 0,
        });
      }
    });
  }
}
