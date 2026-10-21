import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { uuidv7 } from 'uuidv7';
import {
	InternalError,
	ValidationError,
} from '../../../../system/errors/index.js';
import { JobDispatcher } from '../../../../system/jobdispatcher/interfaces/jobdispatcher.interface.js';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import type { IJobDescriptor } from '../../../../system/jobdispatcher/schemas/job.schema.js';
import { createJobDescriptorSchema } from '../../../../system/jobdispatcher/schemas/job.schema.js';
import type { ICreateMcitysInvoice } from '../../../accounting/schemas/mcitys/invoice.schema.js';
import { InvoiceStoreDtoSchema } from '../../schemas/invoice-store.dto.js';
import { PrestashopAgregator } from '../agregators/prestashop.agregator.js';
import { IInvoiceStoreDto } from '../../interfaces/stores.interface.js';
import { PrestashopSyncService } from '../sync/prestashop/prestashop-sync.service.js';

@Processor('store.fetch-invoice-detail', {
	limiter: {
		max: 1, // One job at a time
		duration: 15000, // every 15 seconds (in milliseconds)
	},
})
export class FetchInvoiceDetailProcessor extends WorkerHost {
	constructor(
		@Inject(JobDispatcher)
		private readonly jobDispatcher: JobDispatcher,
		private readonly logger: WinstonLoggerService,
		private readonly prestashopAgregator: PrestashopAgregator,
		private readonly prestashopSyncService: PrestashopSyncService,
	) {
		super();
		console.log('🎯 [WORKER] Instancié avec succès !');
	}

	async process(job: Job<IJobDescriptor<IInvoiceStoreDto>>): Promise<void> {
		console.log(
			'🚀 [WORKER] Job détecté et en cours de traitement ! ID:',
			job.id,
		);
		// Check the data structure
		const zodSchema = createJobDescriptorSchema(InvoiceStoreDtoSchema);
		const checkedInvoice = zodSchema.safeParse(job);
		if (!checkedInvoice.success) {
			this.logger.error(
				`[Prestashop Invoicing Worker] Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}.`,
				JSON.stringify(checkedInvoice.error),
			);
			throw new UnrecoverableError(
				`[Prestashop Invoicing Worker] Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}. ${JSON.stringify(checkedInvoice.error)}`,
			);
		}
		const invoice = checkedInvoice.data.data.data;
		this.logger.log(
			`[Invoicing Worker] Handling invoice ID : ${invoice.id} from ${invoice.source_system} for processing...`,
		);

		try {
			// Agregate invoice data from PrestaShop to Mcitys
			const mcitysInvoice: ICreateMcitysInvoice | null =
				await this.prestashopAgregator.agregateInvoiceData(invoice);
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
					correlationId: job.data.data.correlationId || uuidv7(),
					data: mcitysInvoice,
				},
				{ jobId: `accounting-inv-PRESTASHOP-${invoice.id}` },
			);
		} catch (error: unknown) {
			this.logger.error(
				`[Prestashop Invoicing Worker] Failed to process invoice PRESTASHOP-${invoice.id}`,
				error instanceof Error ? error.stack : String(error),
			);
			//Avoid retry for validation errors.
			if (error instanceof ValidationError) {
				throw new UnrecoverableError(
					`[Prestashop Invoicing Worker] Validation error for invoice PRESTASHOP-${invoice.id}}`,
				);
			}
			// When the job fails, we throw an Error to indicate
			// that the processing of the invoice has failed. This will trigger the retry
			// mechanism in BullMQ based on the backoff strategy defined in the job options.
			throw new InternalError(
				`[Prestashop Invoicing Worker] Failed to process invoice PRESTASHOP-${invoice.id}`,
			);
		}
	}

	@OnWorkerEvent('ready')
	onReady() {
		console.log(
			'🟢 [WORKER EVENT] Le worker est connecté à Redis et écoute la file !',
		);
	}

	@OnWorkerEvent('error')
	onError(err: Error) {
		console.error('❌ [WORKER EVENT] Erreur sur le worker :', err);
	}
}
