import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { PoolClient } from 'pg';
import type { IMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';
import { AccountingRepository } from '../repository/accounting.repository.js';

@Injectable()
export class AccountingService {
	constructor(
		private readonly logger: WinstonLoggerService,
		private readonly dbService: PostgreSQLService,
		private readonly accountingRepository: AccountingRepository,
	) {}
	public generateEReportingForPeriod(startDate: Date, endDate: Date) {
		// The logic to generate the e-reporting file based
		// on the invoices data stored in the database for a specific period
	}

	public sendEReporting() {
		// The logic to send the generated e-reporting file to the tax authorities
	}

	public sendEinvoices() {
		// The logic to send the generated e-invoices to the tax authorities
	}

	public async saveInvoicesToDatabase(
		invoices: IMcitysInvoice[],
	): Promise<void> {
		this.logger.log(`Saving ${invoices.length} invoices to the database.`);

		const transactionClient: PoolClient =
			await this.dbService.beginTransaction();

		try {
			for (const invoice of invoices) {
				const idInvoice = await this.accountingRepository.saveMainInvoiceData(
					invoice,
					transactionClient,
				);

				if (idInvoice === null) {
					throw new InternalServerErrorException(
						'Problem while saving main invoice data.',
					);
				}
			}

			await this.dbService.commit(transactionClient);
		} catch (error) {
			await this.dbService.rollback(transactionClient);
			this.logger.error(getErrorMessage(error));
			throw new InternalServerErrorException(getErrorMessage(error));
		} finally {
			transactionClient.release();
		}
	}
}
