import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AlsService } from '../../../system/als/als.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { BullMqAdapter } from '../../../system/jobdispatcher/adapters/bullmq.adapter.js';
import { StoresRepository } from '../repository/stores.repository.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';

@Injectable()
export class StoresService {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly storesRepository: StoresRepository,
		private readonly logger: WinstonLoggerService,
		private readonly jobDispatcher: BullMqAdapter,
		private readonly alsService: AlsService,
	) {}

	async downloadLastInvoices() {
		try {
			// Get invoice list from PrestaShop
			const invoices = await this.prestashopStoreAdapter.getLastInvoices();
			if (invoices.prestashop.order_invoices.order_invoice.length === 0) {
				this.logger.log('No new invoices found in PrestaShop.');
				return [];
			}
			// Prepare bulk jobs for fetching invoice details
			const correlationId = this.alsService.getCorrelationId() || uuidv7();
			const bulkJobs = invoices.prestashop.order_invoices.order_invoice.map(
				(invoice: IPrestashopInvoice) => ({
					jobName: 'fetch-detail',
					payload: {
						id: uuidv7(),
						pattern: 'store.fetch-invoice-detail',
						timestamp: new Date().toISOString(),
						version: '1.0.0',
						requestId: correlationId,
						data: invoice,
					},
					options: {
						attempts: 3,
						backoff: { type: 'exponential', delay: 5000 } as const,
					},
				}),
			);
			// Dispatch bulk jobs to the queue for fetching invoice details
			await this.jobDispatcher.dispatchBulk(
				'store.fetch-invoice-detail',
				bulkJobs,
			);
			this.logger.log(
				`Successfully dispatched ${bulkJobs.length} invoice IDs to the queue.`,
			);

			/* deprecated, we now fetch invoice details asynchronously via the job queue
			// Get invoice details from PrestaShop
			const invoiceDetails: IMcitysInvoice[] =
				await this.prestashopStoreAdapter.mapInvoices(invoices);

			return invoiceDetails;*/
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error('Failed to download last invoices', errorMessage);
			throw new InternalServerErrorException(
				'Failed to download last invoices: ' + errorMessage,
			);
		}
	}
}
