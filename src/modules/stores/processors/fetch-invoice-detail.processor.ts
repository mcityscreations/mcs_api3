import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InternalServerErrorException } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { BullMqAdapter } from '../../../system/jobdispatcher/adapters/bullmq.adapter.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import type { IJobDescriptor } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { AlsService } from '../../../system/als/als.service.js';
import type { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';

@Processor('store.fetch-invoice-detail', {
	limiter: {
		max: 1, // One job at a time
		duration: 15000, // every 15 seconds (in milliseconds)
	},
})
export class FetchInvoiceDetailProcessor extends WorkerHost {
	constructor(
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly jobDispatcher: BullMqAdapter,
		private readonly logger: WinstonLoggerService,
		private readonly alsService: AlsService,
	) {
		super();
	}

	async process(job: Job<IJobDescriptor<IPrestashopInvoice>>): Promise<void> {
		const invoice = job.data.payload.data;
		const invoiceId = invoice.id;
		this.logger.log(`[Worker Store] Handling invoice ID : ${invoiceId}`);

		try {
			// Retrieving detailed invoice data from PrestaShop
			const invoiceDetails: IMcitysInvoice[] =
				await this.prestashopStoreAdapter.mapInvoices(invoice);

			this.logger.log(
				`[Worker Store] Invoice ${invoiceId} standardized successfully. Sending to accounting...`,
			);

			// Sending the standardized invoice data to the Accounting module by dispatching a job to its dedicated queue
			// We generate a unique jobId to prevent the same invoice from being processed twice by the accounting module
			await this.jobDispatcher.dispatch(
				'accounting.process-invoice',
				'save-accounting-invoice',
				{
					id: uuidv7(),
					pattern: 'accounting.process-invoice',
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					requestId: job.data.payload.requestId || uuidv7(),
					data: invoiceDetails,
				},
				{ jobId: `accounting-inv-PRESTASHOP-${invoiceId}` },
			);
		} catch (error) {
			this.logger.error(
				`[Worker Store] Failed to process invoice PRESTASHOP-${invoiceId}`,
				error instanceof Error ? error.stack : String(error),
			);

			// When the job fails, we throw an InternalServerErrorException to indicate
			// that the processing of the invoice has failed. This will trigger the retry
			// mechanism in BullMQ based on the backoff strategy defined in the job options.
			throw new InternalServerErrorException(
				`Failed to process invoice ${invoiceId}`,
			);
		}
	}
}
