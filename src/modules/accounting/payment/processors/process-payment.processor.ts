import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import { PaymentRepository } from '../repository/payment.repository.js';
import { PaymentService } from '../services/payment.service.js';
import { createJobDescriptorSchema } from '../../../../system/jobdispatcher/schemas/job.schema.js';
import type { IJobDescriptor } from '../../../../system/jobdispatcher/schemas/job.schema.js';
import { CreateMcitysPaymentSchema } from '../schemas/mcitys/payment.schema.js';
import type { ICreateMcitysPayment } from '../schemas/mcitys/payment.schema.js';
import { InternalError } from '../../../../system/errors/index.js';

@Processor('accounting.process-payment', {})
export class ProcessPaymentProcessor extends WorkerHost {
	constructor(
		private readonly paymentRepository: PaymentRepository,
		private readonly paymentService: PaymentService,
		private readonly logger: WinstonLoggerService,
	) {
		super();
	}
	async process(job: Job<IJobDescriptor<ICreateMcitysPayment>>): Promise<void> {
		// 1. Validating job structure
		const zodSchema = createJobDescriptorSchema(CreateMcitysPaymentSchema);
		const parsedPayment = zodSchema.safeParse(job);

		if (!parsedPayment.success) {
			// An invalid schema should not be retried by BullMQ (corrupted data)
			this.logger.error(
				`[Worker accounting.process-payment] Invalid job data structure for job ${job.id} in queue ${job.queueName}: ${parsedPayment.error.message}`,
			);
			throw new UnrecoverableError(
				`Invalid payment data structure for job ${job.id} in queue ${job.queueName}: ${parsedPayment.error.message}`,
			);
		}

		const payment = parsedPayment.data.data.data;

		try {
			// 2. Atomic insertion (Duplicate handling managed directly in the DB via SQL)
			const invoiceID = await this.paymentRepository.addPayment(
				invoice,
				invoiceItems,
			);

			// If the DB query uses ON CONFLICT DO NOTHING and returns no ID
			if (!invoiceID) {
				this.logger.warn(
					`[Payment Processor] Invoice reference ${invoice.reference} from ${invoice.source_system} already exists. Job skipped.`,
				);
				return; // Do not throw an error otherwise BullMQ will retry this task (idempotence)
			}

			this.logger.log(
				`[Payment Processor] Invoice ${invoice.reference} (${invoice.source_system}) saved successfully with ID: ${invoiceID}`,
			);
		} catch (error: unknown) {
			// If the DB raises a unique constraint error (e.g., Postgres code 23505)
			if ((error as { code?: string }).code === '23505') {
				this.logger.warn(
					`[Payment Processor] Duplicate entry detected for invoice ${invoice.reference}. Job completed as duplicate.`,
				);
				throw new UnrecoverableError(
					`Duplicate entry detected for invoice ${invoice.reference}. Job completed as duplicate.`,
				);
			}
				return;
			}

			// For all other real errors (network, DB inaccessible), rethrow to trigger BullMQ retry
			throw new InternalError(
				`Unable to save invoice n° ${invoice.id_technical} from ${invoice.source_system}: ${(error as { message: string }).message}`,
			);
		}
	}
}
