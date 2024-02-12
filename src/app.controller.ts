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
    const hour = momentum.format('YYYY-MM-DD HH');
    const min = momentum.format('YYYY-MM-DD HH:mm');
    const sec = momentum.format('YYYY-MM-DD HH:mm:ss');
    const dataF = new PowerData(data);

    //Obtem ultima leitura armazenda
    const now = await get(ref(database, 'user_identity/now'));
    let last_epa_c = 0;
    let last_epb_c = 0;
    let last_epc_c = 0;
    let last_ept_c = 0;
    let last_epa_g = 0;
    let last_epb_g = 0;
    let last_epc_g = 0;
    let last_ept_g = 0;
    dataF.kwhAPer = 0;
    dataF.kwhBPer = 0;
    dataF.kwhCPer = 0;
    dataF.kwhTPer = 0;
    dataF.kwhAGerPer = 0;
    dataF.kwhBGerPer = 0;
    dataF.kwhCGerPer = 0;
    dataF.kwhTGerPer = 0;
    if (now.exists()) {
      last_epa_c = now.val().epa_c;
      last_epb_c = now.val().epb_c;
      last_epc_c = now.val().epc_c;
      last_ept_c = now.val().ept_c;
      last_epa_g = now.val().epa_g;
      last_epb_g = now.val().epb_g;
      last_epc_g = now.val().epc_g;
      last_ept_g = now.val().ept_g;
      dataF.kwhAPer = dataF.epa_c - last_epa_c;
      dataF.kwhBPer = dataF.epb_c - last_epb_c;
      dataF.kwhCPer = dataF.epc_c - last_epc_c;
      dataF.kwhTPer = dataF.ept_c - last_ept_c;
      dataF.kwhAGerPer = dataF.epa_g - last_epa_g;
      dataF.kwhBGerPer = dataF.epb_g - last_epb_g;
      dataF.kwhCGerPer = dataF.epc_g - last_epc_g;
      dataF.kwhTGerPer = dataF.ept_g - last_ept_g;
    }

    const lastSum = await get(
      ref(database, `user_identity/${year}/${month}/${day}/sum`),
    );
    if (lastSum.exists()) {
      dataF.kwhAConAcum = lastSum.val().kwhAConAcum + dataF.kwhAPer;
      dataF.kwhBConAcum = lastSum.val().kwhBConAcum + dataF.kwhBPer;
      dataF.kwhCConAcum = lastSum.val().kwhCConAcum + dataF.kwhCPer;
      dataF.kwhTConAcum = lastSum.val().kwhTConAcum + dataF.kwhTPer;
      dataF.kwhAGerAcum = lastSum.val().kwhAGerAcum + dataF.kwhAGerPer;
      dataF.kwhBGerAcum = lastSum.val().kwhBGerAcum + dataF.kwhBGerPer;
      dataF.kwhCGerAcum = lastSum.val().kwhCGerAcum + dataF.kwhCGerPer;
      dataF.kwhTGerAcum = lastSum.val().kwhTGerAcum + dataF.kwhTGerPer;
    } else {
      dataF.kwhAConAcum = dataF.kwhAPer;
      dataF.kwhBConAcum = dataF.kwhBPer;
      dataF.kwhCConAcum = dataF.kwhCPer;
      dataF.kwhTConAcum = dataF.kwhTPer;
      dataF.kwhAGerAcum = dataF.kwhAGerPer;
      dataF.kwhBGerAcum = dataF.kwhBGerPer;
      dataF.kwhCGerAcum = dataF.kwhCGerPer;
      dataF.kwhTGerAcum = dataF.kwhTGerPer;
    }

    set(
      ref(
        database,
        `user_identity/${year}/${month}/${day}/${hour}/${min}/${sec}`,
      ),
      dataF,
    );
    set(ref(database, 'user_identity/now'), dataF);

    // UPDATE UPPER LEVEL WITH SUM OF ALL DATA
    this.updateParentSum(
      `user_identity/${year}/${month}/${day}/${hour}/${min}/sum`,
      dataF,
    );
    this.updateParentSum(
      `user_identity/${year}/${month}/${day}/${hour}/sum`,
      dataF,
    );
    this.updateParentSum(`user_identity/${year}/${month}/${day}/sum`, dataF);
    this.updateParentSum(`user_identity/${year}/${month}/sum`, dataF);
    this.updateParentSum(`user_identity/${year}/sum`, dataF);
  }

  private async updateParentSum(sumPath: string, dataF: PowerData) {
    get(ref(database, sumPath)).then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        data = { ...data, ...dataF };
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
          ...dataF,
          kwhAConAcum: dataF.kwhAPer,
          kwhBConAcum: dataF.kwhBPer,
          kwhCConAcum: dataF.kwhCPer,
          kwhTConAcum: dataF.kwhTPer,
          kwhAGerAcum: dataF.kwhAGerPer,
          kwhBGerAcum: dataF.kwhBGerPer,
          kwhCGerAcum: dataF.kwhCGerPer,
          kwhTGerAcum: dataF.kwhTGerPer,
        });
      }
    });
  }
}
