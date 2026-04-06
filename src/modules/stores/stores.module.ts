import { Module } from '@nestjs/common';
import { PrestashopConfigService } from './configs/prestashop/prestashop.config.js';
import { PrestashopAdapter } from './adapters/prestashop.adapter.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';

@Module({
  providers: [
    PrestashopConfigService,
    {
      provide: 'PRESTASHOP_STORE',
      useFactory: (configService: PrestashopConfigService, logger: WinstonLoggerService) => {
        return new PrestashopAdapter(configService, logger);
      },
      inject: [PrestashopConfigService, WinstonLoggerService],

    }
  ],
  exports: ['PRESTASHOP_STORE']
})
export class StoresModule {}
