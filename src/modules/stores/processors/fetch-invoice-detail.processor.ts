import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { uuidv7 } from 'uuidv7';
import { BullMqAdapter } from '../../../system/jobdispatcher/adapters/bullmq.adapter.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import type { IJobDescriptor } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { createJobDescriptorSchema } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import type { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';
import { PrestashopInvoiceSchema } from '../schemas/prestashop/invoices.schema.js';

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
	) {
		super();
	}

	async process(job: Job<IJobDescriptor<IPrestashopInvoice>>): Promise<void> {
		// Check the data structure
		const zodSchema = createJobDescriptorSchema(PrestashopInvoiceSchema);
		const checkedInvoice = zodSchema.safeParse(job.data);
		if (!checkedInvoice.success) {
			this.logger.error(
				`[Worker Store] Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}`,
				JSON.stringify(checkedInvoice.error),
			);
			throw new Error(
				`Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}`,
			);
		}
		const invoice = checkedInvoice.data.payload.data;
		this.logger.log(
			`[Worker Store] Handling invoice ID : ${invoice.id} from PrestaShop for processing...`,
		);

		try {
			// Retrieving detailed invoice data from PrestaShop
			const invoiceDetails: IMcitysInvoice =
				await this.prestashopStoreAdapter.mapInvoice(invoice, 'invoice');
			// Synchronize customer data
			const mcitysPersonID: number | null =
				await this.prestashopStoreAdapter.syncCustomerDataToMcitys(
					invoiceDetails,
				);
			if (!mcitysPersonID)
				throw new Error(
					`Unable to synchronize customer data for Prestashop customer ${invoiceDetails.recipient.id_source_system}`,
				);
			// Record Mcitys Person ID into the invoice
			invoiceDetails.recipient.id = mcitysPersonID.toString();

			this.logger.log(
				`[Worker Store] Invoice ${invoice.id} standardized successfully. Sending to accounting...`,
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
					correlationId: job.data.payload.correlationId || uuidv7(),
					data: invoiceDetails,
				},
				{ jobId: `accounting-inv-PRESTASHOP-${invoice.id}` },
			);
		} catch (error) {
			this.logger.error(
				`[Worker Store] Failed to process invoice PRESTASHOP-${invoice.id}`,
				error instanceof Error ? error.stack : String(error),
			);

			// When the job fails, we throw an Error to indicate
			// that the processing of the invoice has failed. This will trigger the retry
			// mechanism in BullMQ based on the backoff strategy defined in the job options.
			throw new Error(`Failed to process invoice ${invoice.id}`);
		}
	}
}
