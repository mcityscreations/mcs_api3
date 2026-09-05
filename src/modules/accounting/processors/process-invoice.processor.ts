import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { AccountingRepository } from '../repository/accounting.repository.js';
import { createJobDescriptorSchema } from '../../../system/jobdispatcher/schemas/job.schema.js';
import type { IJobDescriptor } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { CreateMcitysInvoiceSchema } from '../../accounting/schemas/mcitys/invoice.schema.js';
import type { ICreateMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import { InternalError } from '../../../system/errors/index.js';

@Processor('accounting.process-invoice', {})
export class ProcessInvoiceProcessor extends WorkerHost {
	constructor(
		private readonly accountingRepository: AccountingRepository,
		private readonly logger: WinstonLoggerService,
	) {
		super();
	}
	async process(job: Job<IJobDescriptor<ICreateMcitysInvoice>>): Promise<void> {
		// 1. Validating job structure
		const zodSchema = createJobDescriptorSchema(CreateMcitysInvoiceSchema);
		const parsedInvoice = zodSchema.safeParse(job.data);

		if (!parsedInvoice.success) {
			// An invalid schema should not be retried by BullMQ (corrupted data)
			throw new UnrecoverableError(
				`Invalid invoice data structure for job ${job.id} in queue ${job.queueName}: ${parsedInvoice.error.message}`,
			);
		}

		const invoice = parsedInvoice.data.payload.data;
		const invoiceItems = JSON.stringify(invoice.order_details);

		try {
			// 2. Atomic insertion (Duplicate handling managed directly in the DB via SQL)
			const invoiceID = await this.accountingRepository.saveMainInvoiceData(
				invoice,
				invoiceItems,
			);

			// If the DB query uses ON CONFLICT DO NOTHING and returns no ID
			if (!invoiceID) {
				this.logger.warn(
					`[Accounting Invoice Processor] Invoice reference ${invoice.reference} from ${invoice.source_system} already exists. Job skipped.`,
				);
				return; // Do not throw an error otherwise BullMQ will retry this task (idempotence)
			}

			this.logger.log(
				`[Accounting Invoice Processor] Invoice ${invoice.reference} (${invoice.source_system}) saved successfully with ID: ${invoiceID}`,
			);
		} catch (error: unknown) {
			// If the DB raises a unique constraint error (e.g., Postgres code 23505)
			if ((error as { code?: string }).code === '23505') {
				this.logger.warn(
					`[Accounting Invoice Processor] Duplicate entry detected for invoice ${invoice.reference}. Job completed as duplicate.`,
				);
				return;
			}

			// For all other real errors (network, DB inaccessible), rethrow to trigger BullMQ retry
			throw new InternalError(
				`Unable to save invoice n° ${invoice.id_technical} from ${invoice.source_system}: ${(error as { message: string }).message}`,
			);
		}
	}
}
