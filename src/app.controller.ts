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
  test(@Body() data: any) {
    const momentum = moment().tz('America/Sao_Paulo');
    const year = momentum.format('YYYY');
    const month = momentum.format('YYYY-MM');
    const day = momentum.format('YYYY-MM-DD');
    const hour = momentum.format('YYYY-MM-DD HH:mm:ss');
    const dataF = new PowerData(data);

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
        const acc = { ...dataF };
        const d = data;
        acc.pa += d.pa;
        acc.pb += d.pb;
        acc.pc += d.pc;
        acc.pt += d.pt;
        acc.epa_c += d.epa_c;
        acc.epb_c += d.epb_c;
        acc.epc_c += d.epc_c;
        acc.ept_c += d.ept_c;
        acc.epa_g += d.epa_g;
        acc.epb_g += d.epb_g;
        acc.epc_g += d.epc_g;
        acc.ept_g += d.ept_g;
        acc.iarms = (acc.iarms + d.iarms) / 2;
        acc.ibrms = (acc.ibrms + d.ibrms) / 2;
        acc.icrms = (acc.icrms + d.icrms) / 2;
        acc.uarms += (acc.uarms + d.uarms) / 2;
        acc.ubrms += (acc.ubrms + d.ubrms) / 2;
        acc.ucrms += (acc.ucrms + d.ucrms) / 2;
        acc.freq += d.freq;
        acc.id += d.id;
        acc.itrms += d.itrms;
        acc.pfa += d.pfa;
        acc.pfb += d.pfb;
        acc.pfc += d.pfc;
        acc.pft += d.pft;
        acc.pga += d.pga;
        acc.pgb += d.pgb;
        acc.pgc += d.pgc;
        acc.qa += d.qa;
        acc.qb += d.qb;
        acc.qc += d.qc;
        acc.qt += d.qt;
        acc.sa += d.sa;
        acc.sb += d.sb;
        acc.sc += d.sc;
        acc.st += d.st;
        acc.tpsd += d.tpsd;
        acc.yuaub += d.yuaub;
        acc.yuauc += d.yuauc;
        acc.yubuc += d.yubuc;
        set(ref(database, sumPath), acc);
      } else {
        set(ref(database, sumPath), dataF);
      }
    });
  }
}
