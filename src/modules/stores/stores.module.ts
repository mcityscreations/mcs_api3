import { Module } from '@nestjs/common';
import { FetchInvoiceDetailProcessor } from './prestashop/processors/fetch-invoice-detail.processor.js';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { PrestashopConfigService } from './prestashop/configs/prestashop.config.js';
import { PrestashopAdapter } from './prestashop/adapters/prestashop.adapter.js';
import { PrestashopAgregator } from './prestashop/agregators/prestashop.agregator.js';
import { WinstonLoggerService } from '../../system/logger/logger-service/winston-logger.service.js';
import { StoresCronService } from './cron/cron.service.js';
import { StoresRepository } from './repository/stores.repository.js';
import { SystemModule } from '../../system/system.module.js';
import { StoresController } from './controllers/stores.controller.js';
import { StoresService } from './services/stores.service.js';
import { PeopleModule } from '../content/people/people.module.js';
import { PeopleService } from '../content/people/people.service.js';
import { CountryService } from '../content/taxonomy/country/service/country.service.js';
import { AddressModule } from '../content/address/address.module.js';
import { CountryModule } from '../content/taxonomy/country/country.module.js';
import { PrestashopSyncService } from './prestashop/sync/prestashop/prestashop-sync.service.js';

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
		StoresCronService,
		StoresRepository,
		StoresService,
		FetchInvoiceDetailProcessor,
		PrestashopAgregator,
		PrestashopSyncService,
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
		BullBoardModule.forFeature({
			name: 'store.fetch-invoice-detail',
			adapter: BullMQAdapter,
		}),
		PeopleModule,
		AddressModule,
		CountryModule,
	],
	exports: ['PRESTASHOP_STORE'],
})
export class StoresModule {}
