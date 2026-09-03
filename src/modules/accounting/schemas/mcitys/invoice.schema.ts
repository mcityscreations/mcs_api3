/** Canonical Data Model : Common invoice schema to be used as an interface between Qonto,
 * Prestashop and other accounting systems. All invoices transmitted by a third party API
 * must be mapped to the following data structure before processing. */
import { z } from 'zod';
import { AddressSchema } from '../../../content/address/schemas/address.schema.js';

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

// 1. Reusable schemas
const utcDateSchema = z.coerce
	.date()
	.transform((date) => date.toISOString())
	.pipe(z.iso.datetime());

const orderDetailSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	description: z.string().nullable().optional(),
	quantity: z.number().int().positive(),
	unit_price_tax_excl: z.number().int().nonnegative(),
	discount: z
		.object({
			type: z.enum(['percentage', 'absolute']),
			value: z.number().int().positive(),
			discount_amount_tax_excl: z.number().int().nonnegative().optional(),
		})
		.optional(),
	unit_price_tax_excl_discount: z.number().int().nonnegative().optional(),
	unit_price_tax_incl: z.number().int().nonnegative(),
	vat_rate: z.number().int().nonnegative(),
	total_price_tax_excl: z.number().int().nonnegative(),
	total_price_tax_incl: z.number().int().nonnegative(),
});

// 2. Base invoice schema containing the common structure for both objects
const BaseInvoiceSchema = z.object({
	id_technical: z.string(),
	reference: z.string(),
	source_system: z.enum(['qonto', 'prestashop']),
	invoice_type: z.enum(['invoice', 'credit_note', 'proforma']),
	issue_date: utcDateSchema,
	due_date: utcDateSchema,
	paid_at: utcDateSchema.optional(),
	currency: currenciesEnum,
	document_type: z
		.enum(['INVOICE', 'CREDIT_NOTE', 'PROFORMA'])
		.default('INVOICE'),
	order_details: z.array(orderDetailSchema),
	total_amount_tax_excl: z.number().int().nonnegative(),
	total_amount_tax_incl: z.number().int().nonnegative(),
	vat_amount: z.number().int().nonnegative(),
	discount_amount: z.number().int().nonnegative(),
	payment_status: z.enum(['paid', 'unpaid', 'draft']),
	payment_direction: z.enum(['debit', 'credit']),
});

// 3. Extension for the complete invoice (McitysInvoice)
export const McitysInvoiceSchema = BaseInvoiceSchema.extend({
	emitter: z
		.object({
			id: z.uuidv7(),
			legal_number: z.string(),
			company_name: z.string().optional(),
			email: z.email(),
			country_code: z.string().length(2).default('FR'),
		})
		.optional(),
	recipient: z.object({
		id: z.uuidv7().nullable().optional(),
		id_source_system: z.string(),
		firstname: z.string(),
		lastname: z.string(),
		company_name: z.string().optional(),
		email: z.email(),
		legal_number: z.string().optional(),
		vat_number: z.string().optional(),
		country_code: z.string().length(2).default('FR'),
		billing_address: AddressSchema,
	}),
});
export type IMcitysInvoice = z.infer<typeof McitysInvoiceSchema>;

// 4. Extension for the creation (CreateMcitysInvoice)
export const CreateMcitysInvoiceSchema = BaseInvoiceSchema.extend({
	emitter: z.object({
		id: z.number().nullable().optional(),
	}),
	recipient: z.object({
		id: z.number().nullable().optional(),
		id_billing_address: z.number().nullable().optional(),
	}),
});
export type ICreateMcitysInvoice = z.infer<typeof CreateMcitysInvoiceSchema>;
