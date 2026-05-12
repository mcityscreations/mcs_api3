import { Module } from '@nestjs/common';
import { PrestashopConfigService } from './configs/prestashop/prestashop.config.js';
import { PrestashopAdapter } from './adapters/prestashop.adapter.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopCronService } from './cron/cron.service.js';
import { StoresRepository } from './repository/stores.repository.js';
import { SystemModule } from '../../system/system.module.js';
import { StoresController } from './controllers/stores.controller.js';

@Module({
  providers: [
    PrestashopConfigService,
    {
      provide: 'PRESTASHOP_STORE',
      useFactory: (configService: PrestashopConfigService, logger: WinstonLoggerService) => {
        return new PrestashopAdapter(configService, logger);
      },
      inject: [PrestashopConfigService, WinstonLoggerService],

    },
    PrestashopCronService,
    StoresRepository,
    PrestashopAdapter,
  ],
  controllers:[StoresController,]
  imports: [SystemModule],
  exports: ['PRESTASHOP_STORE']
})
export class StoresModule {}
