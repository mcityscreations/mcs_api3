import type { ICreateMcitysInvoice } from '../mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../../../stores/schemas/prestashop/invoices.schema.js';
import type { IPrestashopOrderDetailsNormalized } from '../../../stores/schemas/prestashop/order-detail.schema.js';
import type { IPrestashopOrder } from '../../../stores/schemas/prestashop/order.schema.js';
import { DateService } from '../../../../common/dates/dates.service.js';

const dateService = new DateService();

/** Mapper function to convert a PrestaShop invoice to a Mcitys invoice */
export function mapPrestashopInvoiceToMcitysInvoice(
	prestashopInvoice: IPrestashopInvoice,
	prestashopMainOrderData: IPrestashopOrder,
	prestashopOrderDetails: IPrestashopOrderDetailsNormalized,
	invoiceType: 'invoice' | 'credit_note' | 'proforma' = 'invoice',
	modifiedData: { addressID: number; customerID: number },
): ICreateMcitysInvoice {
	// Secure parsing of invoice totals with fallback to 0 if values are missing or invalid
	const invoiceTaxIncl = Number(prestashopInvoice.total_paid_tax_incl ?? 0);
	const invoiceTaxExcl = Number(prestashopInvoice.total_paid_tax_excl ?? 0);

	return {
		id_technical: prestashopInvoice.id?.toString() ?? '0',
		reference: prestashopInvoice.number.toString(),
		source_system: 'prestashop',
		invoice_type: invoiceType,
		issue_date: prestashopInvoice.date_add
			? dateService
					.stringDateToUtcDate(prestashopInvoice.date_add)
					.toISOString()
			: new Date().toISOString(),
		due_date: prestashopInvoice.date_add
			? dateService
					.stringDateToUtcDate(prestashopInvoice.date_add)
					.toISOString()
			: new Date().toISOString(),
		currency: 'EUR',
		document_type: 'INVOICE',
		emitter: {
			id: '019b8af6-d80c-7aec-b2af-ce615fc092a5',
			legal_number: '84478363900017',
			company_name: 'Mcitys', // Company name of the emitter
			email: 'contact@mcitys.com', // Email of the emitter
			country_code: 8, // Country code of the emitter
		},
		recipient: {
			id: modifiedData.customerID, // Mcitys person ID
			id_billing_address: modifiedData.addressID,
		},
		order_details: prestashopOrderDetails.items.map((orderDetail) => {
			const priceExcl = Number(orderDetail.unit_price_tax_excl ?? 0);
			const priceIncl = Number(orderDetail.unit_price_tax_incl ?? 0);

			// Calculating VAT rate dynamically based on the unit price including
			// and excluding tax for better accuracy in Factur-X generation
			let calculatedVatRate = 0;
			if (priceExcl > 0) {
				calculatedVatRate =
					Math.round((priceIncl / priceExcl - 1) * 100 * 100) / 100;
			}

			const hasPercentDiscount =
				!!orderDetail.reduction_percent &&
				Number(orderDetail.reduction_percent) > 0;

			return {
				id:
					orderDetail.product_reference?.toString() ||
					orderDetail.product_id.toString(),
				label: orderDetail.product_name,
				description: 'N/A',
				quantity: Number(orderDetail.product_quantity ?? 0),
				unit_price_tax_excl: priceExcl,
				unit_price_tax_incl: priceIncl,
				vat_rate: calculatedVatRate,
				discount: {
					type: hasPercentDiscount ? 'percentage' : 'absolute',
					value: hasPercentDiscount
						? Number(orderDetail.reduction_percent)
						: Number(orderDetail.reduction_amount ?? 0),
					discount_amount_tax_excl: Number(
						orderDetail.reduction_amount_tax_excl ?? 0,
					),
				},
				total_price_tax_excl: Number(orderDetail.total_price_tax_excl ?? 0),
				total_price_tax_incl: Number(orderDetail.total_price_tax_incl ?? 0),
			};
		}),
		// Aligning totals with the INVOICE rather than the overall order
		total_amount_tax_incl: invoiceTaxIncl,
		total_amount_tax_excl: invoiceTaxExcl,
		vat_amount: Math.round((invoiceTaxIncl - invoiceTaxExcl) * 100) / 100,
		discount_amount: Number(
			prestashopMainOrderData.total_discounts_tax_excl ?? 0,
		),
		payment_status:
			Number(prestashopMainOrderData.total_paid ?? 0) >= invoiceTaxIncl
				? 'paid'
				: 'unpaid',
		payment_direction: invoiceType === 'credit_note' ? 'credit' : 'debit',
		paid_at: prestashopInvoice.date_add
			? dateService
					.stringDateToUtcDate(prestashopInvoice.date_add)
					.toISOString()
			: undefined,
	};
}
