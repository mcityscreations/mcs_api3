import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrestashopConfigService } from './configs/prestashop/prestashop.config.js';
import { PrestashopAdapter } from './adapters/prestashop.adapter.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopCronService } from './cron/cron.service.js';
import { StoresRepository } from './repository/stores.repository.js';
import { SystemModule } from '../../system/system.module.js';
import { StoresController } from './controllers/stores.controller.js';
import { StoresService } from './services/stores.service.js';
import { PeopleModule } from '../content/people/people.module.js';
import { PeopleService } from '../content/people/people.service.js';
import { CountryService } from '../content/taxonomy/country/service/country.service.js';
import { AddressModule } from '../content/address/address.module.js';

@Module({
	providers: [
		PrestashopConfigService,
		{
			provide: 'PRESTASHOP_STORE',
			useFactory: (
				configService: PrestashopConfigService,
				logger: WinstonLoggerService,
				storesRepository: StoresRepository,
				peopleService: PeopleService,
				countryService: CountryService,
			) => {
				return new PrestashopAdapter(
					configService,
					logger,
					storesRepository,
					peopleService,
					countryService,
				);
			},
			inject: [
				PrestashopConfigService,
				WinstonLoggerService,
				StoresRepository,
				PeopleService,
				CountryService,
			],
		},
		PrestashopCronService,
		StoresRepository,
		PrestashopAdapter,
		StoresService,
	],
	controllers: [StoresController],
	imports: [
		SystemModule,
		BullModule.registerQueue({
			name: 'store.fetch-invoice-detail',
			defaultJobOptions: {
				removeOnComplete: 100, // Keep only the last 100 successful jobs in Redis
				removeOnFail: 500, // Keep the last 500 failed jobs for debugging
			},
		}),
		PeopleModule,
		AddressModule,
	],
	exports: ['PRESTASHOP_STORE'],
})
export class StoresModule {}
