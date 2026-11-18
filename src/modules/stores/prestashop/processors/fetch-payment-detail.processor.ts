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
import { PrestashopAgregator } from '../agregators/prestashop.agregator.js';
import {
	IStoreProcessorDto,
	StoreProcessorDtoSchema,
} from '../../schemas/store-processor.dto.js';
import { PrestashopSyncService } from '../sync/prestashop/prestashop-sync.service.js';
import { ICreateMcitysPayment } from 'src/modules/accounting/payment/schemas/mcitys/payment.schema.js';

@Processor('store.fetch-payment-detail', {
	limiter: {
		max: 1, // One job at a time
		duration: 15000, // every 15 seconds (in milliseconds)
	},
})
export class FetchPaymentDetailProcessor extends WorkerHost {
	constructor(
		@Inject(JobDispatcher)
		private readonly jobDispatcher: JobDispatcher,
		private readonly logger: WinstonLoggerService,
		private readonly prestashopAgregator: PrestashopAgregator,
		private readonly prestashopSyncService: PrestashopSyncService,
	) {
		super();
		console.log('🎯 [Store Payment Worker] Instancié avec succès !');
	}

	async process(job: Job<IJobDescriptor<IStoreProcessorDto>>): Promise<void> {
		console.log(
			'🚀 [Store Payment Worker] Job détecté et en cours de traitement ! ID:',
			job.id,
		);
		// Check the data structure
		const zodSchema = createJobDescriptorSchema(StoreProcessorDtoSchema);
		const checkedPayment = zodSchema.safeParse(job);

		if (!checkedPayment.success) {
			this.logger.error(
				`[Store Payment Worker] Invalid payment data structure for payment Job : ${job.id} in queue : ${job.queueName}.`,
				JSON.stringify(checkedPayment.error),
			);
			throw new UnrecoverableError(
				`[Store Payment Worker] Invalid payment data structure for payment Job : ${job.id} in queue : ${job.queueName}. ${JSON.stringify(checkedPayment.error)}`,
			);
		}
		const payment = checkedPayment.data.data.data;
		this.logger.log(
			`[Store Payment Worker] Handling payment ID : ${payment.id} from ${payment.source_system} for processing...`,
		);

		try {
			// Agregate payment data from PrestaShop to Mcitys
			const mcitysPayment: ICreateMcitysPayment | null =
				await this.prestashopAgregator.agregatePaymentData(payment);
			if (!mcitysPayment) {
				this.logger.warn(
					`[Store Payment Worker] Failed to aggregate payment data for payment ID : ${payment.id} from ${payment.source_system}.`,
				);
				return; // Skip processing this payment if aggregation fails
			}
			// Success
			this.logger.log(
				`[Store Payment Worker] Payment ${payment.id} standardized successfully. Sending to accounting...`,
			);

			// Sending the standardized payment data to the Accounting module by dispatching a job to its dedicated queue
			// We generate a unique jobId to prevent the same payment from being processed twice by the accounting module
			await this.jobDispatcher.dispatch(
				'accounting.process-payment',
				'save-accounting-payment',
				{
					id: uuidv7(),
					pattern: 'accounting.process-payment',
					timestamp: new Date().toISOString(),
					version: '1.0.0',
					correlationId: job.data.data.correlationId || uuidv7(),
					data: mcitysPayment,
				},
				{ jobId: `accounting-pay-${payment.source_system}-${payment.id}` },
			);
		} catch (error: unknown) {
			this.logger.error(
				`[Store Payment Worker] Failed to process payment ${payment.source_system}-${payment.id}`,
				error instanceof Error ? error.stack : String(error),
			);
			//Avoid retry for validation errors.
			if (error instanceof ValidationError) {
				throw new UnrecoverableError(
					`[Store Payment Worker] Validation error for payment ${payment.source_system}-${payment.id}}`,
				);
			}
			// When the job fails, we throw an Error to indicate
			// that the processing of the payment has failed. This will trigger the retry
			// mechanism in BullMQ based on the backoff strategy defined in the job options.
			throw new InternalError(
				`[Store Payment Worker] Failed to process payment ${payment.source_system}-${payment.id}`,
			);
		}
	}

	@OnWorkerEvent('ready')
	onReady() {
		console.log(
			'🟢 [Store Payment Worker] Le worker est connecté à Redis et écoute la file !',
		);
	}

	@OnWorkerEvent('error')
	onError(err: Error) {
		console.error('❌ [Store Payment Worker] Erreur sur le worker :', err);
	}
}
