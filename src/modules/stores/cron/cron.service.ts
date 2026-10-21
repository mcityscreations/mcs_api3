import { Injectable } from '@nestjs/common';
import { StoresService } from '../services/stores.service.js';
import { Cron } from '@nestjs/schedule';
import { DateService } from '../../../common/dates/dates.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';

@Injectable()
export class StoresCronService {
	constructor(
		private readonly dateService: DateService,
		private readonly storesService: StoresService,
		private readonly logger: WinstonLoggerService,
	) {}

	// This task will execute every Monday at 2 AM
	@Cron('0 2 * * 1', { timeZone: 'Europe/Paris' })
	async getLastInvoices() {
		await this.storesService.downloadLastInvoices();
	}
	// This task will execute every 5 minutes
	@Cron('*/5 * * * *', { timeZone: 'Europe/Paris' })
	async checkForNewInvoices() {
		await this.storesService.downloadLastInvoices();
	}
}
