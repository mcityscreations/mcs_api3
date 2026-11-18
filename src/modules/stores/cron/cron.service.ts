import { Injectable } from '@nestjs/common';
import { StoresService } from '../services/stores.service.js';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class StoresCronService {
	constructor(private readonly storesService: StoresService) {}

	// This task will execute every Monday at 2 AM
	@Cron('0 2 * * 1', { timeZone: 'Europe/Paris' })
	async getLastInvoices() {
		await this.storesService.getLastInvoices();
	}
	// This task will execute every Monday at 2 AM
	@Cron('0 2 * * 1', { timeZone: 'Europe/Paris' })
	async getLastPayments() {
		await this.storesService.getLastPayments();
	}
}
