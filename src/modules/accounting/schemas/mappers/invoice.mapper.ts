import type { IMcitysInvoice } from '../mcitys/invoice.schema.js';
import type { IPrestashopInvoice } from '../../../stores/schemas/prestashop/invoices.schema.js';
import type { IPrestashopOrderDetailsNormalized } from '../../../stores/schemas/prestashop/order-detail.schema.js';
import type { IPrestashopOrder } from '../../../stores/schemas/prestashop/order.schema.js';
import type { IPrestashopAddress } from '../../../stores/schemas/prestashop/address.schema.js';
import type { IPrestashopCustomer } from '../../../stores/schemas/prestashop/customer.schema.js';

/** Mapper function to convert a PrestaShop invoice to a Mcitys invoice */
export function mapPrestashopInvoiceToMcitysInvoice(
	prestashopInvoice: IPrestashopInvoice,
	prestashopMainOrderData: IPrestashopOrder,
	prestashopOrderDetails: IPrestashopOrderDetailsNormalized,
	customerData: IPrestashopCustomer,
	prestashopAddressData: IPrestashopAddress,
	countryIsoCode: string = 'FR',
): IMcitysInvoice {
	// Secure parsing of invoice totals with fallback to 0 if values are missing or invalid
	const invoiceTaxIncl = Number(prestashopInvoice.total_paid_tax_incl ?? 0);
	const invoiceTaxExcl = Number(prestashopInvoice.total_paid_tax_excl ?? 0);

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
		emitter: {
			id: '019b8af6-d80c-7aec-b2af-ce615fc092a5',
			legal_number: '84478363900017',
		},
		customer: {
			id: prestashopMainOrderData.id_customer.toString(),
			firstname: prestashopAddressData.firstname,
			lastname: prestashopAddressData.lastname,
			company_name: prestashopAddressData.company?.trim() || undefined,
			email: customerData.email,
			legal_number: prestashopAddressData.vat_number?.trim() || undefined,
			country_code: countryIsoCode, // 'FR' au lieu de l'ID '8'
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
	};
}
