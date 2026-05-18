import { Inject, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';

@Injectable()
export class StoresService {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly logger: WinstonLoggerService,
	) {}

	async downloadLastInvoices() {
		try {
			// Get invoice details from PrestaShop
			const invoices = await this.prestashopStoreAdapter.getLastInvoices();
			// Get invoice details from PrestaShop
			if (invoices.prestashop.order_invoices.order_invoice.length === 0) {
				this.logger.log('No new invoices found in PrestaShop.');
			}
			const invoiceDetails: IPrestashopInvoice[] = [];
			for (const invoice of invoices.prestashop.order_invoices.order_invoice) {
				const detail = await this.prestashopStoreAdapter.getInvoiceDetail(
					invoice.id,
				);
				invoiceDetails.push(detail);
			}
			return invoiceDetails.sort((a, b) => a.id! - b.id!); // Sort invoices by ID in ascending order
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new Error('Failed to download last invoices: ' + errorMessage);
		}
	}
}
