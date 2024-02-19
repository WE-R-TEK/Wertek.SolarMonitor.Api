import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
//import * as moment from 'moment-timezone';
import { PowerData } from './models/power-data/power-data.class';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { EventGateway } from './gateway/event/event.gateway';
import * as puppeteer from 'puppeteer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventGateway: EventGateway,
  ) {}

  @Get()
  getHello(): string {
    this.eventGateway.server.emit('events', 'Hello from the server');

    const token = process.env.INFLUXDB_TOKEN;
    console.log(token);
    const url = 'http://52.40.160.15:8086';

    const client = new InfluxDB({ url, token });

    //     //WRITE

    const org = `wertek`;
    //const bucket = `solarmonitor`;

    //     const writeClient = client.getWriteApi(org, bucket, 'ns');

    //     for (let i = 0; i < 5; i++) {
    //       const point = new Point('measurement1')
    //         .tag('tagname1', 'tagvalue1').
    //         .intField('field1', i);

    //       void setTimeout(() => {
    //         writeClient.writePoint(point);
    //       }, i * 1000); // separate points by 1 second

    //       void setTimeout(() => {
    //         writeClient.flush();
    //       }, 5000);
    //     }

    //     //READ DATA

    const queryClient = client.getQueryApi(org);
    const fluxQuery = `data = () => from(bucket: "solarmonitor")
		|> range(start: 2024-02-13T00:00:00Z)
		|> filter(fn: (r) => r._measurement == "powerdata" and r._field == "ept_g")
	  
	  first = data() |> first()
	  last = data() |> last()
	  
	  dayResult = union(tables: [first, last])
		|> difference()
	  
	  union( tables: [dayResult,last])`;

    queryClient.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        console.log(row, tableObject);
      },
      error: (error) => {
        console.error('\nError', error);
      },
      complete: () => {
        console.log('\nSuccess');
      },
    });

    //     //AGGREGRATE DATA
    //     queryClient = client.getQueryApi(org);
    //     fluxQuery = `from(bucket: "solarmonitor")
    //  |> range(start: -10m)
    //  |> filter(fn: (r) => r._measurement == "measurement1")
    //  |> mean()`;

    //     queryClient.queryRows(fluxQuery, {
    //       next: (row, tableMeta) => {
    //         const tableObject = tableMeta.toObject(row);
    //         console.log(tableObject);
    //       },
    //       error: (error) => {
    //         console.error('\nError', error);
    //       },
    //       complete: () => {
    //         console.log('\nSuccess');
    //       },
    //     });

    return this.appService.getHello();
  }

  @Post()
  async test(@Body() data: any) {
    // const momentum = moment().tz('America/Sao_Paulo');
    // const year = momentum.format('YYYY');
    // const month = momentum.format('YYYY-MM');
    // const day = momentum.format('YYYY-MM-DD');
    // const hour = momentum.format('YYYY-MM-DD HH');
    // const min = momentum.format('YYYY-MM-DD HH:mm');
    // const sec = momentum.format('YYYY-MM-DD HH:mm:ss');
    const dataF = new PowerData(data);

    const token =
      'ZgzULOOA4gARxR7mxs3qGEwpC_rUzZkunLaxPTcA6iTl1yWpu0Mob_CYxHKLCAFqUyZE8WfcjAnY9c73St_9Kg==';
    const url = 'http://52.40.160.15:8086';

    const client = new InfluxDB({ url, token });

    //WRITE

    const org = `wertek`;
    const bucket = `solarmonitor`;

    const writeClient = client.getWriteApi(org, bucket, 'ns');

    const point = new Point('powerdata')
      .tag('user', 'user_identity')
      .floatField('pa', dataF.pa)
      .floatField('pb', dataF.pb)
      .floatField('pc', dataF.pc)
      .floatField('pt', dataF.pt)
      .floatField('epa_c', dataF.epa_c)
      .floatField('epb_c', dataF.epb_c)
      .floatField('epc_c', dataF.epc_c)
      .floatField('ept_c', dataF.ept_c)
      .floatField('epa_g', dataF.epa_g)
      .floatField('epb_g', dataF.epb_g)
      .floatField('epc_g', dataF.epc_g)
      .floatField('ept_g', dataF.ept_g)
      .floatField('iarms', dataF.iarms)
      .floatField('ibrms', dataF.ibrms)
      .floatField('icrms', dataF.icrms)
      .floatField('uarms', dataF.uarms)
      .floatField('ubrms', dataF.ubrms)
      .floatField('ucrms', dataF.ucrms)
      .floatField('freq', dataF.freq)
      .floatField('id', dataF.id)
      .floatField('itrms', dataF.itrms)
      .floatField('pfa', dataF.pfa)
      .floatField('pfb', dataF.pfb)
      .floatField('pfc', dataF.pfc)
      .floatField('pft', dataF.pft)
      .floatField('pga', dataF.pga)
      .floatField('pgb', dataF.pgb)
      .floatField('pgc', dataF.pgc)
      .floatField('qa', dataF.qa)
      .floatField('qb', dataF.qb)
      .floatField('qc', dataF.qc)
      .floatField('qt', dataF.qt)
      .floatField('sa', dataF.sa)
      .floatField('sb', dataF.sb)
      .floatField('sc', dataF.sc)
      .floatField('st', dataF.st)
      .floatField('tpsd', dataF.tpsd)
      .floatField('yuaub', dataF.yuaub)
      .floatField('yuauc', dataF.yuauc)
      .floatField('yubuc', dataF.yubuc);

    writeClient.writePoint(point);
    await writeClient.flush();

    this.extractSolarData();

    this.eventGateway.server.emit('events', 'Hello from the server');
  }

  private async extractSolarData() {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto('http://solar-monitoramento.intelbras.com.br/login');

      await page.type('#val_loginAccount', 'ricardo.ara.silva@gmail.com');
      await page.type('#val_loginPwd', '234567');

      await Promise.all([
        page.waitForNavigation(),
        page.waitForSelector('.val_eToday'),
        page.waitForRequest(
          'http://solar-monitoramento.intelbras.com.br/panel/intelbras/getInvDayChart',
        ),
        page.waitForNetworkIdle(),
        page.click('.loginB'),
      ]);

      const data = await page.evaluate(() => {
        const dataElement = document.querySelector('.val_eToday');
        return dataElement?.textContent ?? null;
      });

      console.log(`Extracted data: ${data}`);

      await browser.close();

      const token =
        'ZgzULOOA4gARxR7mxs3qGEwpC_rUzZkunLaxPTcA6iTl1yWpu0Mob_CYxHKLCAFqUyZE8WfcjAnY9c73St_9Kg==';
      const url = 'http://52.40.160.15:8086';

      const client = new InfluxDB({ url, token });

      //WRITE

      const org = `wertek`;
      const bucket = `solarmonitor`;

      const writeClient = client.getWriteApi(org, bucket, 'ns');

      const point = new Point('solardata')
        .tag('user', 'user_identity')
        .floatField('total', data);

      writeClient.writePoint(point);
      await writeClient.flush();
    } catch (error) {
      console.error('Error extracting solar data', error);
    }
  }
}
