import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventGateway } from './gateway/event/event.gateway';
import { PowerTaxValueModule } from './power-tax-value/power-tax-value.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { dataBaseConfig } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PowerTaxValueModule,
    SequelizeModule.forRoot(dataBaseConfig),
  ],
  controllers: [AppController],
  providers: [AppService, EventGateway],
})
export class AppModule {}
