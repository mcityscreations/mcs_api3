import z from 'zod';

/**
 * Qonto invoice RESPONSE schema
 * @see https://docs.qonto.com/api-reference/business-api/expense-management/client-quotes-notes/client-invoices/create-a-client-invoice
 * 
 * {
  "client_invoice": {
    "id": "4d5418bb-bd0d-4df4-865c-c07afab8bb48",
    "organization_id": "4d5418bb-bd0d-4df4-865c-c07afab8bb48",
    "number": "INV001",
    "purchase_order": "<string>",
    "status": "paid",
    "invoice_url": "https://pay.qonto.com/invoices/00000000-0000-0000-0000-000000000000",
    "contact_email": "contact@qonto.com",
    "terms_and_conditions": "This is an example.",
    "discount_conditions": "Pas d’escompte accordé pour paiement anticipé.",
    "late_payment_penalties": "En cas de non-paiement à la date d'échéance, des pénalités calculées à trois fois le taux d’intérêt légal seront appliquées.",
    "legal_fixed_compensation": "Tout retard de paiement entraînera une indemnité forfaitaire pour frais de recouvrement de 40€.",
    "header": "This is an example.",
    "footer": "This is an example.",
    "currency": "EUR",
    "total_amount": {
      "value": "12.52",
      "currency": "EUR"
    },
    "total_amount_cents": 1252,
    "vat_amount": {
      "value": "0.51",
      "currency": "EUR"
    },
    "vat_amount_cents": 51,
    "issue_date": "2022-03-01",
    "due_date": "2022-03-01",
    "performance_date": "2022-03-01",
    "performance_start_date": "2022-03-01",
    "performance_end_date": "2022-03-31",
    "created_at": "2022-03-04T17:58:30+02:00",
    "finalized_at": "2022-03-04T17:58:30+02:00",
    "paid_at": "2022-03-04T17:58:30+02:00",
    "stamp_duty_amount": "1.00",
    "items": [
      {
        "title": "Plastic tables",
        "description": "Plastic tables for McDonald’s restaurants",
        "quantity": "1.5",
        "unit": "meter",
        "unit_price": {
          "value": "10.0",
          "currency": "EUR"
        },
        "unit_price_cents": 1000,
        "vat_rate": "0.1",
        "vat_exemption_reason": "N1",
        "discount": {
          "type": "percentage",
          "value": "0.1",
          "amount": {
            "value": "120",
            "currency": "EUR"
          }
        },
        "total_vat": {
          "value": "120",
          "currency": "EUR"
        },
        "total_vat_cents": 12000,
        "total_amount": {
          "value": "300.50",
          "currency": "EUR"
        },
        "total_amount_cents": 30050,
        "subtotal": {
          "value": "120",
          "currency": "EUR"
        },
        "subtotal_cents": 12000
      }
    ],
    "client": {
      "id": "33v418bb-bd0d-4df4-865c-c07afab8bb48",
      "name": "McDonald's",
      "first_name": "Jane",
      "last_name": "Doe",
      "type": "individual",
      "email": "client@qonto.com",
      "vat_number": "FR32123456789",
      "tax_identification_number": "123456789",
      "address": "1 place de l’Opéra",
      "city": "Paris",
      "zip_code": "75009",
      "province_code": "<string>",
      "country_code": "fr",
      "recipient_code": "<string>",
      "locale": "fr",
      "billing_address": {
        "street_address": "123 Main Street",
        "city": "Paris",
        "zip_code": "75009",
        "province_code": "<string>",
        "country_code": "FR"
      },
      "delivery_address": {
        "street_address": "123 Main Street",
        "city": "Paris",
        "zip_code": "75009",
        "province_code": "<string>",
        "country_code": "FR"
      }
    },
    "payment_methods": [
      {
        "beneficiary_name": "John Doe",
        "bic": "ABCDEFG1XXX",
        "iban": "FR1420041010050500013M02606",
        "type": "transfer"
      }
    ],
    "credit_notes_ids": [
      "3c90c3cc-0d44-4b50-8888-8dd25736052a"
    ],
    "organization": {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "legal_name": "<string>",
      "legal_number": "<string>",
      "legal_country": "<string>",
      "address_line_1": "<string>",
      "address_line_2": "<string>",
      "address_zipcode": "<string>",
      "address_city": "<string>",
      "address_country": "<string>",
      "company_leadership": "Jan Mueller",
      "district_court": "Munich",
      "commercial_register_number": "HRB12345B",
      "vat_number": "FR123456789",
      "tax_number": "123/123/1234",
      "legal_capital_share": {
        "value": "10000.00",
        "currency": "EUR"
      },
      "transaction_type": "goods",
      "vat_payment_condition": "on_receipts"
    },
    "invoice_type": "standard",
    "attachment_id": "4d5418bb-bd0d-4df4-865c-c07afab8bb48",
    "discount": {
      "type": "percentage",
      "value": "0.1",
      "amount": {
        "value": "10.00",
        "currency": "EUR"
      }
    },
    "amount_paid": {
      "value": "12.52",
      "currency": "EUR"
    },
    "einvoicing_status": "pending",
    "welfare_fund": {
      "type": "TC01",
      "rate": "0.0001"
    },
    "withholding_tax": {
      "reason": "RF01",
      "rate": "0.01",
      "payment_reason": "L1",
      "amount": "1.00"
    },
    "payment_reporting": {
      "conditions": "TP01",
      "method": "MP01"
    },
    "einvoicing_lifecycle_events": [
      {
        "status_code": 200,
        "reason": "DOUBLE FACTURE",
        "reason_message": "I already received this invoice",
        "timestamp": "2024-12-04T11:05:16.4497Z"
      }
    ]
  }
}
 */

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

const discount = z.enum(['percentage', 'absolute']);

const invoiceItem = z.array(
	z.object({
		title: z.string(),
		quantity: z.string(),
		unit_price: z.object({
			value: z.string(),
			currency: currenciesEnum,
		}),
		vat_rate: z.string(),
		description: z.string().nullable().optional(),
		unit: z.string().nullable().optional(),
		vat_exemption_reason: z.string().nullable().optional(),
		discount: z
			.object({
				type: discount,
				value: z.string(),
			})
			.nullable()
			.optional(),
	}),
);
const createInvoiceStatus = z.enum(['unpaid', 'draft']);

// Data schema returned by Qonto once the invoice created
export const QontoClientCreatedInvoiceSchema = z.object({
	client_invoice: z.object({
		id: z.string(), // Technical Qonto public ID
		organization_id: z.string(),
		number: z.string(), // Accounting reference number
		pruchase_order: z.string(),
		items: z.array(invoiceItem),
	}),
});

// Data schema describing the data required to create an invoice
export const QontoClientCreateInvoiceSchema = z.object({
	client_id: z.string(), // Qonto client ID
	issue_date: z.iso.date(),
	due_date: z.iso.date(),
	currency: currenciesEnum,
	payment_methods: z.object({
		iban: z.string(),
	}),
	items: z.array(invoiceItem),
	upload_id: z.string(), // UUID
	// The performance period defines the date range during which
	// the job or service is expected to be completed by the client.
	performance_start_date: z.iso.date().nullable().optional(),
	performance_end_date: z.iso.date().nullable().optional(),
	status: createInvoiceStatus.nullable().optional(),
	number: z.string().nullable().optional(),
	purchase_order: z.string().nullable().optional(),
	terms_and_conditions: z.string().nullable().optional(),
	header: z.string().nullable().optional(),
	footer: z.string().nullable().optional(),
	setting: z
		.object({
			vat_number: z.string(),
			company_leadership: z.string(),
			district_court: z.string(),
			commercial_register_number: z.string(),
			tax_number: z.string(),
			legal_capital_share: z.object({
				value: z.string(),
				currency: currenciesEnum,
			}),
			transaction_type: z.string(),
			vat_payment_condition: z.string().nullable().optional(),
			discount_conditions: z.string().nullable().optional(),
			late_payment_penalties: z.string().nullable().optional(),
			legal_fixed_compensation: z.string().nullable().optional(),
		})
		.nullable()
		.optional(),
	discount: discount.nullable().optional(), // Global discount
});
