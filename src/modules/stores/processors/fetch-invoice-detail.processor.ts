import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { uuidv7 } from 'uuidv7';
import { InternalError } from '../../../system/errors/index.js';
import { BullMqAdapter } from '../../../system/jobdispatcher/adapters/bullmq.adapter.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import type { IJobDescriptor } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { createJobDescriptorSchema } from '../../../system/jobdispatcher/schemas/job.schema.js';
import type { ICreateMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';
import { PrestashopInvoiceSchema } from '../schemas/prestashop/invoices.schema.js';
import { PrestashopAgregator } from '../agregators/prestashop/prestashop.agregator.js';

@Processor('store.fetch-invoice-detail', {
	limiter: {
		max: 1, // One job at a time
		duration: 15000, // every 15 seconds (in milliseconds)
	},
})
export class FetchInvoiceDetailProcessor extends WorkerHost {
	constructor(
		private readonly jobDispatcher: BullMqAdapter,
		private readonly logger: WinstonLoggerService,
		private readonly prestashopAgregator: PrestashopAgregator,
	) {
		super();
	}

	async process(job: Job<IJobDescriptor<IPrestashopInvoice>>): Promise<void> {
		// Check the data structure
		const zodSchema = createJobDescriptorSchema(PrestashopInvoiceSchema);
		const checkedInvoice = zodSchema.safeParse(job.data);
		if (!checkedInvoice.success) {
			throw new UnrecoverableError(
				`[Prestashop Invoicing Worker] Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}. ${JSON.stringify(checkedInvoice.error)}`,
			);
		}
		const invoice = checkedInvoice.data.payload.data;
		this.logger.log(
			`[Prestashop Invoicing Worker] Handling invoice ID : ${invoice.id} from PrestaShop for processing...`,
		);

		try {
			// Agregate and synchronize invoice data from PrestaShop to Mcitys
			const mcitysInvoice: ICreateMcitysInvoice | null =
				await this.prestashopAgregator.agregateInvoiceData(
					job.data.payload.data,
				);
			if (!mcitysInvoice) {
				this.logger.warn(
					`[Prestashop Invoicing Worker] Failed to aggregate invoice data for invoice ID : ${invoice.id} from PrestaShop.`,
				);
				return; // Skip processing this invoice if aggregation fails
			}
			// Success
			this.logger.log(
				`[Prestashop Invoicing Worker] Invoice ${invoice.id} standardized successfully. Sending to accounting...`,
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
					data: mcitysInvoice,
				},
				{ jobId: `accounting-inv-PRESTASHOP-${invoice.id}` },
			);
		} catch (error: unknown) {
			this.logger.error(
				`[Prestashop Invoicing Worker] Failed to process invoice PRESTASHOP-${invoice.id}`,
				error instanceof Error ? error.stack : String(error),
			);

			// When the job fails, we throw an Error to indicate
			// that the processing of the invoice has failed. This will trigger the retry
			// mechanism in BullMQ based on the backoff strategy defined in the job options.
			throw new InternalError(
				`[Prestashop Invoicing Worker] Failed to process invoice PRESTASHOP-${invoice.id}`,
			);
		}
	}
}
