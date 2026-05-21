import { Inject, Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import type { IPrestashopInvoice } from '../schemas/prestashop/invoices.schema.js';
import { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import { IPrestashopOrderDetailsNormalized } from '../schemas/prestashop/order-detail.schema.js';
import { mapPrestashopInvoiceToMcitysInvoice } from '../../accounting/schemas/mappers/invoice.mapper.js';

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
			const invoiceDetails: IMcitysInvoice[] = [];
			for (const invoice of invoices.prestashop.order_invoices.order_invoice) {
				const invoiceGlobalDetails: IPrestashopInvoice =
					await this.prestashopStoreAdapter.getInvoiceDetail(invoice.id);
				const invoiceItems: IPrestashopOrderDetailsNormalized =
					await this.prestashopStoreAdapter.getOrderDetailsByInvoiceID(
						invoice.id,
					);
				const mappedInvoice = mapPrestashopInvoiceToMcitysInvoice(
					invoiceGlobalDetails,
					invoiceItems,
				);
				invoiceDetails.push(mappedInvoice);
			}
			return invoiceDetails.sort((a, b) => a.id! - b.id!); // Sort invoices by ID in ascending order
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			throw new Error('Failed to download last invoices: ' + errorMessage);
		}
	}
}
