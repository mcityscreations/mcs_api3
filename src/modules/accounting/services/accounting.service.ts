import { Injectable } from '@nestjs/common';
import { InternalError } from '../../../system/errors/index.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import type { ICreateMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';
import { AccountingRepository } from '../repository/accounting.repository.js';

@Injectable()
export class AccountingService {
	constructor(
		private readonly logger: WinstonLoggerService,
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
		invoices: ICreateMcitysInvoice[],
	): Promise<void> {
		this.logger.log(
			`[AccountingService] Saving ${invoices.length} invoices to the database.`,
		);
		try {
			for (const invoice of invoices) {
				const idInvoice = await this.accountingRepository.saveInvoice(
					invoice,
					JSON.stringify(invoice.order_details),
				);

				if (idInvoice === null) {
					throw new InternalError(
						`[AccountingService] Problem while saving invoice n°${invoice.reference}. from source system ${invoice.source_system}.`,
					);
				}
				this.logger.log(
					`[AccountingService] Invoice n°${invoice.reference} from source system ${invoice.source_system} saved successfully with id ${idInvoice}.`,
				);
			}
		} catch (error) {
			throw new InternalError(getErrorMessage(error));
		}
	}
}
