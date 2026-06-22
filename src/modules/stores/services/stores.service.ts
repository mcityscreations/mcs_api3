import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';

@Injectable()
export class StoresService {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly logger: WinstonLoggerService,
	) {}

	async downloadLastInvoices() {
		try {
			// Get invoice list from PrestaShop
			const invoices = await this.prestashopStoreAdapter.getLastInvoices();
			if (invoices.prestashop.order_invoices.order_invoice.length === 0) {
				this.logger.log('No new invoices found in PrestaShop.');
				return [];
			}
			// Get invoice details from PrestaShop
			const invoiceDetails: IMcitysInvoice[] =
				await this.prestashopStoreAdapter.mapInvoices(invoices);

			return invoiceDetails;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error('Failed to download last invoices', errorMessage);
			throw new InternalServerErrorException(
				'Failed to download last invoices: ' + errorMessage,
			);
		}
	}
}
