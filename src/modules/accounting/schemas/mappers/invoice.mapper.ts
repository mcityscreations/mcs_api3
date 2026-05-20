import type { IMcitysInvoice } from '../mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../../../stores/schemas/prestashop/invoices.schema.js';
import { IPrestashopOrderDetailsNormalized } from '../../../stores/schemas/prestashop/order.schema.js';

/** Mapper function to convert a PrestaShop invoice to a Mcitys invoice */
export function mapPrestashopInvoiceToMcitysInvoice(
	prestashopInvoice: IPrestashopInvoice,
	prestashopOrderDetails: IPrestashopOrderDetailsNormalized,
): IMcitysInvoice {
	return {
		id_technical: prestashopInvoice.id?.toString() ?? '0',
		reference: prestashopInvoice.number.toString(),
		issue_date: prestashopInvoice.date_add
			? new Date(prestashopInvoice.date_add).getTime()
			: Date.now(),
		due_date: prestashopInvoice.date_add
			? new Date(prestashopInvoice.date_add).getTime()
			: Date.now(),
		currency: 'EUR',
		document_type: 'INVOICE',
	};
}
