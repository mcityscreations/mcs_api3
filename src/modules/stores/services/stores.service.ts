import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AlsService } from '../../../system/als/als.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { JobDispatcher } from '../../../system/jobdispatcher/interfaces/jobdispatcher.interface.js';
import { StoresRepository } from '../repository/stores.repository.js';
import { PrestashopAdapter } from '../prestashop/adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { IStoreProcessorDto } from '../schemas/store-processor.dto.js';
import { PaymentService } from '../../accounting/payment/services/payment.service.js';

@Injectable()
export class StoresService {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly storesRepository: StoresRepository,
		private readonly paymentService: PaymentService,
		private readonly logger: WinstonLoggerService,
		@Inject(JobDispatcher)
		private readonly jobDispatcher: JobDispatcher,
	) {}

	async getLastInvoices() {
		try {
			// Get invoice list from PrestaShop
			const invoices = await this.prestashopStoreAdapter.getLastInvoices();
			if (invoices.length === 0) {
				this.logger.log('No new invoices found in PrestaShop.');
				return [];
			}
			// Prepare bulk jobs for fetching invoice details
			const correlationId = AlsService.correlationId || uuidv7();
			const bulkJobs = invoices.map((invoice: IStoreProcessorDto) => ({
				name: 'fetch-detail',
				data: {
					id: uuidv7(),
					pattern: 'store.fetch-invoice-detail',
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					correlationId: correlationId,
					data: invoice,
				},
				opts: {
					attempts: 3,
					backoff: { type: 'exponential', delay: 5000 } as const,
				},
			}));
			// Dispatch bulk jobs to the queue for fetching invoice details
			await this.jobDispatcher.dispatchBulk(
				'store.fetch-invoice-detail',
				bulkJobs,
			);
			this.logger.log(
				`Successfully dispatched ${bulkJobs.length} invoice IDs to the queue.`,
			);
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new InternalServerErrorException(
				'Failed to download last invoices: ' + errorMessage,
			);
		}
	}

	public async getLastPayments() {
		try {
			// Get last prestashop payment synced
			const lastPrestashopPayment =
				await this.paymentService.getLastPayment('prestashop');
			const lastPrestashopPaymentID = lastPrestashopPayment
				? Number.parseInt(lastPrestashopPayment.id_source)
				: 1;
			const payments = await this.prestashopStoreAdapter.getLastPayments(
				lastPrestashopPaymentID,
			);
			if (!payments) {
				this.logger.log(`[Stores Service] No payment detected on Prestashop.`);
				return;
			}
			// Prepare bulk jobs for fetching payment details
			const correlationId = AlsService.correlationId || uuidv7();
			const bulkJobs = payments.map((payment) => ({
				name: 'fetch-detail',
				data: {
					id: uuidv7(),
					pattern: 'store.fetch-payment-detail',
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					correlationId: correlationId,
					data: {
						id_payment: payment.order_payment,
						system_source: 'prestashop',
					},
				},
				opts: {
					attempts: 3,
					backoff: { type: 'exponential', delay: 5000 } as const,
				},
			}));
			// Dispatch bulk jobs to the queue for fetching payment details
			await this.jobDispatcher.dispatchBulk(
				'store.fetch-payment-detail',
				bulkJobs,
			);
			this.logger.log(
				`Successfully dispatched ${bulkJobs.length} payment IDs to the queue.`,
			);
		} catch (error: unknown) {
			throw new InternalServerErrorException(
				JSON.stringify((error as Error).stack),
				`[Stores Service] Failed to download last payments. ${getErrorMessage(error)}`,
			);
		}
	}
}
