import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { WinstonLoggerService } from '../../../system/logger/logger-service/winston-logger.service.js';
import { PrestashopAdapter } from '../adapters/prestashop.adapter.js';
import { getErrorMessage } from '../../../common/utils/error.utils.js';
import type { IPrestashopOrder } from '../schemas/prestashop/order.schema.js';
import { IMcitysInvoice } from '../../accounting/schemas/mcitys/invoice.schema.js';
import { IPrestashopOrderDetailsNormalized } from '../schemas/prestashop/order-detail.schema.js';
import { mapPrestashopInvoiceToMcitysInvoice } from '../../accounting/schemas/mappers/invoice.mapper.js';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import { StoresRepository } from '../repository/stores.repository.js';

@Injectable()
export class StoresService {
	constructor(
		@Inject('PRESTASHOP_STORE')
		private readonly prestashopStoreAdapter: PrestashopAdapter,
		private readonly storesRepository: StoresRepository,
		private readonly logger: WinstonLoggerService,
		private readonly sqlEngine: PostgreSQLService,
	) {}

	async downloadLastInvoices() {
		try {
			// Get invoice details from PrestaShop
			const invoices = await this.prestashopStoreAdapter.getLastInvoices();
			// Get invoice details from PrestaShop
			if (invoices.prestashop.order_invoices.order_invoice.length === 0) {
				this.logger.log('No new invoices found in PrestaShop.');
				return [];
			}
			const invoiceDetails: IMcitysInvoice[] = [];
			for (const invoice of invoices.prestashop.order_invoices.order_invoice) {
				const mainOrderData: IPrestashopOrder =
					await this.prestashopStoreAdapter.getMainOrderDataByInvoiceID(
						invoice.id,
					);
				const detailedOrderData: IPrestashopOrderDetailsNormalized =
					await this.prestashopStoreAdapter.getOrderDetailsByInvoiceID(
						invoice.id,
					);
				const customerData =
					await this.prestashopStoreAdapter.getCustomerDataByID(
						mainOrderData.id_customer,
					);
				const addressData =
					await this.prestashopStoreAdapter.getAddressDataByID(
						mainOrderData.id_address_invoice,
					);
				const mappedInvoice = mapPrestashopInvoiceToMcitysInvoice(
					invoice,
					mainOrderData,
					detailedOrderData,
					customerData,
					addressData,
				);
				invoiceDetails.push(mappedInvoice);
			}
			return invoiceDetails;
		} catch (error) {
			const errorMessage = getErrorMessage(error);
			this.logger.error('Failed to download last invoices', errorMessage);
			throw new InternalServerErrorException(
				'Failed to download last invoices: ' + errorMessage,
			);
		}
	}

	saveInvoicesToDatabase(invoices: IMcitysInvoice[]) {
		this.logger.log(`Saving ${invoices.length} invoices to the database.`);
		// Start a transaction to save all invoices to the database
		//const transaction = await this.sqlEngine.beginTransaction();
	}
}
