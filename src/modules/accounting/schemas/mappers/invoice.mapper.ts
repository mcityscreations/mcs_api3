import type { IMcitysInvoice } from '../mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../../../stores/schemas/prestashop/invoices.schema.js';

/** Mapper function to convert a PrestaShop invoice to a Mcitys invoice */
export function mapPrestashopInvoiceToMcitysInvoice(
	prestashopInvoice: IPrestashopInvoice,
): IMcitysInvoice {
	return {
		id_technical: prestashopInvoice.id.toString(),
		reference: prestashopInvoice.reference,
		issue_date: new Date(prestashopInvoice.issue_date),
		due_date: new Date(prestashopInvoice.due_date),
		currency: prestashopInvoice.currency,
		document_type: 'INVOICE',
		customer: {
			id: prestashopInvoice.customer.id.toString(),
			email: prestashopInvoice.customer.email,
			legal_number: prestashopInvoice.customer.legal_number,
			country_code: prestashopInvoice.customer.country_code,
		},
	};
}
