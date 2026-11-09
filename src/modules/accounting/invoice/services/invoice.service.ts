import { Injectable } from '@nestjs/common';
import {
	InternalError,
	ValidationError,
	NotFoundError,
} from '../../../../system/errors/index.js';
import { getErrorMessage } from '../../../../common/utils/error.utils.js';
import { WinstonLoggerService } from '../../../../system/logger/logger-service/winston-logger.service.js';
import type { ICreateMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';
import { InvoiceRepository } from '../repository/invoice.repository.js';

@Injectable()
export class InvoiceService {
	constructor(
		private readonly logger: WinstonLoggerService,
		private readonly invoiceRepository: InvoiceRepository,
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
			`[InvoiceService] Saving ${invoices.length} invoices to the database.`,
		);
		try {
			for (const invoice of invoices) {
				const idInvoice = await this.invoiceRepository.saveInvoice(
					invoice,
					JSON.stringify(invoice.order_details),
				);

				if (idInvoice === null) {
					throw new InternalError(
						`[InvoiceService] Problem while saving invoice n°${invoice.reference}. from source system ${invoice.source_system}.`,
					);
				}
				this.logger.log(
					`[InvoiceService] Invoice n°${invoice.reference} from source system ${invoice.source_system} saved successfully with id ${idInvoice}.`,
				);
			}
		} catch (error) {
			throw new InternalError(getErrorMessage(error));
		}
	}

	public async getInvoiceIdByOrderId(payload: {
		orderId: string;
		systemSource: string;
	}): Promise<string | null> {
		const { orderId, systemSource } = payload;
		if (
			!orderId ||
			typeof orderId !== 'string' ||
			!systemSource ||
			typeof systemSource !== 'string'
		) {
			throw new ValidationError(
				`[InvoiceService] Invalid orderId or systemSource provided: orderId=${orderId}, systemSource=${systemSource}`,
			);
		}
		const result = await this.invoiceRepository.getInvoiceIdByOrderId(payload);
		if (!result) {
			throw new NotFoundError(
				`[InvoiceService] No invoice found for orderId: ${orderId} and systemSource: ${systemSource}`,
			);
		}
		return result;
	}
}
