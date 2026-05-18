import { Module } from '@nestjs/common';
import { PrestashopConfigService } from './configs/prestashop/prestashop.config.js';
import { PrestashopAdapter } from './adapters/prestashop.adapter.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopCronService } from './cron/cron.service.js';
import { StoresRepository } from './repository/stores.repository.js';
import { SystemModule } from '../../system/system.module.js';
import { StoresController } from './controllers/stores.controller.js';
import { StoresService } from './services/stores.service.js';

@Module({
	providers: [
		PrestashopConfigService,
		{
			provide: 'PRESTASHOP_STORE',
			useFactory: (
				configService: PrestashopConfigService,
				logger: WinstonLoggerService,
				storesRepository: StoresRepository,
			) => {
				return new PrestashopAdapter(configService, logger, storesRepository);
			},
			inject: [PrestashopConfigService, WinstonLoggerService, StoresRepository],
		},
		PrestashopCronService,
		StoresRepository,
		PrestashopAdapter,
		StoresService,
	],
	controllers: [StoresController],
	imports: [SystemModule],
	exports: ['PRESTASHOP_STORE'],
})
export class StoresModule {}
