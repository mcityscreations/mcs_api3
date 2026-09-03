import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { AccountingRepository } from '../repository/accounting.repository.js';
import { createJobDescriptorSchema } from '../../../system/jobdispatcher/schemas/job.schema.js';
import type { IJobDescriptor } from '../../../system/jobdispatcher/schemas/job.schema.js';
import { McitysInvoiceSchema } from '../../accounting/schemas/mcitys/invoice.schema.js';
import type { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';

@Processor('accounting.process-invoice', {})
export class ProcessInvoiceProcessor extends WorkerHost {
	constructor(
		private readonly dbService: PostgreSQLService,
		private readonly accountingRepository: AccountingRepository,
		private readonly logger: WinstonLoggerService,
	) {
		super();
	}
	async process(job: Job<IJobDescriptor<IMcitysInvoice>>): Promise<void> {
		// Check if the job data is valid
		const zodSchema = createJobDescriptorSchema(McitysInvoiceSchema);
		const parsedInvoice = zodSchema.safeParse(job.data);
		if (!parsedInvoice.success) {
			throw new Error(
				`Invalid invoice data structure for invoice Job : ${job.id} in queue : ${job.queueName}`,
			);
		}
		// Check if the invoice isn't already saved in the database to avoid duplicates
		const invoice = parsedInvoice.data.payload.data;
		const invoiceExists = await this.accountingRepository.doesInvoiceExist({
			reference: invoice.reference,
			systemSource: invoice.source_system,
		});
		if (invoiceExists) {
			this.logger.log(
				`Invoice with reference ${invoice.reference} from system source ${invoice.source_system} already exists in the database. Skipping save operation.`,
			);
			return;
		}
		// Save the invoice to the database
		const transactionClient = await this.dbService.beginTransaction();
		try {
			// Save the main invoice data to the database
			const idInvoice = await this.accountingRepository.saveMainInvoiceData(
				invoice,
				transactionClient,
			);
			if (idInvoice === null) {
				throw new Error(
					`Problem while saving main invoice data. Job : ${job.id} in queue : ${job.queueName}`,
				);
			}
			// Save invoice line items to the database
		} catch (error) {
			await this.dbService.rollback(transactionClient);
			throw error;
		} finally {
			await this.dbService.commit(transactionClient);
		}
	}
}
