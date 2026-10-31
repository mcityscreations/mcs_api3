import z from 'zod';

/**
 * Qonto client schema
 * @see https://docs.qonto.com/api-reference/business-api/clients/list-clients
 * {
  "clients": [
    {
      "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+33123456789",
      "phone": {
        "country_code": "+33",
        "number": "123456789"
      },
      "kind": "company",
      "type": "company",
      "email": "john.doe@qonto.eu",
      "extra_emails": [
        "additional@email.com",
        "backup@email.com"
      ],
      "currency": "EUR",
      "e_invoicing_address": "987654321",
      "e_invoicing_reachable": true,
      "vat_number": "<string>",
      "tax_identification_number": "<string>",
      "address": "<string>",
      "city": "<string>",
      "zip_code": "<string>",
      "province_code": "<string>",
      "country_code": "<string>",
      "billing_address": {
        "street_address": "123 Main Street",
        "city": "Paris",
        "zip_code": "75009",
        "province_code": "<string>",
        "country_code": "fr"
      },
      "delivery_address": {
        "street_address": "123 Main Street",
        "city": "Paris",
        "zip_code": "75009",
        "province_code": "<string>",
        "country_code": "fr"
      },
      "recipient_code": "<string>",
      "created_at": "<string>",
      "updated_at": "<string>",
      "locale": "fr"
    }
  ],
  "meta": {
    "current_page": 2,
    "next_page": 3,
    "prev_page": 1,
    "total_pages": 11,
    "total_count": 210,
    "per_page": 20
  }
}
 */
const personType = z.enum(['individual', 'company', 'freelancer']);

export const QontoClientSchema = z.object({
	clients: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			first_name: z.string(),
			last_name: z.string(),
			phone_number: z.string(),
			phone: z.object({
				country_code: z.string(),
				number: z.string(),
			}),
			kind: personType,
			type: personType,
			email: z.email(),
			extra_emails: z.preprocess((val) => {
				if (!val) return null;
				if (Array.isArray(val))
					return val.filter((email: unknown) => email !== '') as string[];
				return val;
			}, z.array(z.email()).nullable()),
			currency: z.string(),
			e_invoicing_address: z.string(),
			e_invoicing_reachable: z.boolean(),
			vat_number: z.string().nullable().optional(),
			tax_identification_number: z.string().nullable().optional(), //SIRET
			address: z.string(),
			city: z.string().length(50),
			zip_code: z.string().length(20),
			province_code: z.string().length(2),
			country_code: z.string().length(2),
			billing_address: z.object({
				street_address: z.string(),
				city: z.string().length(50),
				zip_code: z.string().length(20),
				province_code: z.string().length(2),
				country_code: z.string().length(2),
			}),
			delivery_address: z.object({
				street_address: z.string(),
				city: z.string().length(50),
				zip_code: z.string().length(20),
				province_code: z.string().length(2),
				country_code: z.string().length(2),
			}),
			recipient_code: z.string(),
			created_at: z.string(),
			updated_at: z.string(),
			locale: z.string(),
		}),
	),
	meta: z.object({
		current_page: z.number(),
		next_page: z.number(),
		prev_page: z.number(),
		total_pages: z.number(),
		total_count: z.number(),
		per_page: z.number(),
	}),
});
