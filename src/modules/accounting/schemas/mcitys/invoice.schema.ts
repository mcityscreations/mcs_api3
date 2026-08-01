/** Canonical Data Model : Common invoice schema to be used as an interface between Qonto,
 * Prestashop and other accounting systems. All invoices transmitted by a third party API
 * must be mapped to the following data structure before processing. */
import { z } from 'zod';

const currenciesEnum = z.enum([
	'EUR',
	'AED',
	'AUD',
	'BGN',
	'CAD',
	'CHF',
	'CNY',
	'CZK',
	'DKK',
	'GBP',
	'GHS',
	'HKD',
	'HUF',
	'ILS',
	'MXN',
	'NOK',
	'NZD',
	'PEN',
	'PLN',
	'RON',
	'RSD',
	'SAR',
	'SEK',
	'SGD',
	'TRY',
	'USD',
	'ZAR',
	'ZMW',
]);

export const McitysInvoiceSchema = z.object({
	id_technical: z.string(), // Technical ID of the invoice in the third party system (Qonto, Prestashop, etc.)
	reference: z.string(), // Reference of the invoice (e.g. invoice number)
	source_system: z.enum(['qonto', 'prestashop']), // Source system of the invoice (e.g. Qonto, Prestashop, etc.)
	invoice_type: z.enum(['invoice', 'credit_note', 'proforma']), // Type of the invoice (e.g. invoice, credit note, proforma)
	issue_date: z.coerce
		.date()
		.transform((date) => date.toISOString())
		.pipe(z.iso.datetime()), // Issue date of the invoice as string in UTC timezone (e.g. "2023-11-21T22:35:14Z")
	due_date: z.coerce
		.date()
		.transform((date) => date.toISOString())
		.pipe(z.iso.datetime()), // Due date of the invoice as string in UTC timezone (e.g. "2023-11-21T22:35:14Z")
	paid_at: z.coerce
		.date()
		.transform((date) => date.toISOString())
		.pipe(z.iso.datetime())
		.optional(), // Payment date of the invoice as string in UTC timezone (e.g. "2023-11-21T22:35:14Z")
	currency: currenciesEnum, // Currency of the invoice (e.g. EUR, USD, etc.)
	document_type: z
		.enum(['INVOICE', 'CREDIT_NOTE', 'PROFORMA'])
		.default('INVOICE'),
	emitter: z
		.object({
			id: z.string(),
			legal_number: z.string(), // SIRET
		})
		.optional(),
	recipient: z.object({
		id: z.string(), // Technical ID of the customer in the third party system (Qonto, Prestashop, etc.)
		firstname: z.string(), // First name of the customer
		lastname: z.string(), // Last name of the customer
		company_name: z.string().optional(), // Company name of the customer
		email: z.email(), // Email of the customer
		legal_number: z.string().optional(), // Legal number of the customer (e.g. SIRET in France)
		country_code: z.string().length(2).default('FR'),
	}),
	order_details: z.array(
		z.object({
			id: z.string().min(1), // Technical ID of the item in the third party system (Qonto, Prestashop, etc.)
			label: z.string().min(1), // Label of the item (e.g. product name)
			description: z.string().nullable().optional(), // Description of the item
			quantity: z.number().int().positive(), // Quantity of the item
			unit_price_tax_excl: z.number().int().nonnegative(), // Unit price in cents of the item excluding tax
			discount: z
				.object({
					type: z.enum(['percentage', 'absolute']), // Type of the discount (e.g. percentage, absolute)
					value: z.number().int().positive(), // Value of the discount in Basis Points (e.g. 1000 for 10%) or in cents if 'absolute'
					discount_amount_tax_excl: z.number().int().nonnegative().optional(), // Amount of the discount in cents excluding tax (only for absolute discounts)
				})
				.optional(),
			unit_price_tax_excl_discount: z.number().int().nonnegative().optional(), // Reduced unit price in cents of the item excluding tax
			unit_price_tax_incl: z.number().int().nonnegative(), // Unit price in cents of the item including tax
			vat_rate: z.number().int().nonnegative(), // Basis Point of the VAT rate of the item (e.g. 2000 for 20%)
			total_price_tax_excl: z.number().int().nonnegative(), // Total price in cents of the item excluding tax
			total_price_tax_incl: z.number().int().nonnegative(), // Total price in cents of the item including tax
		}),
	),
	total_amount_tax_excl: z.number().int().nonnegative(), // Total amount in cents of the invoice excluding tax
	total_amount_tax_incl: z.number().int().nonnegative(), // Total amount in cents of the invoice including tax
	vat_amount: z.number().int().nonnegative(), // Total amount in cents of the VAT of the invoice
	discount_amount: z.number().int().nonnegative(), // Total amount in cents of the discount of the invoice
	payment_status: z.enum(['paid', 'unpaid', 'draft']), // Payment status of the invoice
	payment_direction: z.enum(['debit', 'credit']), // Payment direction of the invoice
});
export type IMcitysInvoice = z.infer<typeof McitysInvoiceSchema>;
