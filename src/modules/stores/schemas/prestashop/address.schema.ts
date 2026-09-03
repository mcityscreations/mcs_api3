import z from 'zod';

/**
 * @see https://devdocs.prestashop-project.org/9/webservice/resources/addresses/
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
        <address>
            <id><![CDATA[]]></id>
            <id_customer><![CDATA[]]></id_customer>
            <id_manufacturer><![CDATA[]]></id_manufacturer>
            <id_supplier><![CDATA[]]></id_supplier>
            <id_warehouse><![CDATA[]]></id_warehouse>
            <id_country><![CDATA[]]></id_country>
            <id_state><![CDATA[]]></id_state>
            <alias><![CDATA[]]></alias>
            <company><![CDATA[]]></company>
            <lastname><![CDATA[]]></lastname>
            <firstname><![CDATA[]]></firstname>
            <vat_number><![CDATA[]]></vat_number>
            <address1><![CDATA[]]></address1>
            <address2><![CDATA[]]></address2>
            <postcode><![CDATA[]]></postcode>
            <city><![CDATA[]]></city>
            <other><![CDATA[]]></other>
            <phone><![CDATA[]]></phone>
            <phone_mobile><![CDATA[]]></phone_mobile>
            <dni><![CDATA[]]></dni>
            <deleted><![CDATA[]]></deleted>
            <date_add><![CDATA[]]></date_add>
            <date_upd><![CDATA[]]></date_upd>
        </address>
    </prestashop>
 */

export const PrestashopAddressSchema = z.object({
	id: z.string().transform(Number).or(z.number()).nullable().optional(),
	id_customer: z.union([
		z
			.object({
				'#text': z.coerce.number(),
			})
			.transform((val) => val['#text']),

		z.coerce.number(),
	]),
	id_manufacturer: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	id_supplier: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	id_warehouse: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	id_country: z.union([
		z
			.object({
				'#text': z.coerce.number(),
			})
			.transform((val) => val['#text']),

		z.coerce.number(),
	]),
	id_state: z.string().transform(Number).or(z.number()).nullable().optional(),
	alias: z.string(),
	company: z.string().nullable().optional(),
	lastname: z.string(),
	firstname: z.string(),
	vat_number: z.string().nullable().optional(),
	address1: z.string(),
	address2: z.string().nullable().optional(),
	postcode: z.string().transform(Number).or(z.number()).nullable().optional(),
	city: z.string(),
	other: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	phone_mobile: z.string().nullable().optional(),
	dni: z.string().nullable().optional(),
	deleted: z.number().nullable().optional(),
	date_add: z.string().nullable().optional(),
	date_upd: z.string().nullable().optional(),
});
export type IPrestashopAddress = z.infer<typeof PrestashopAddressSchema>;

// Reusable TypeScript type guards
function isRecord(val: unknown): val is Record<string, unknown> {
	return typeof val === 'object' && val !== null;
}

export const PrestashopAddressesResponseSchema = z.preprocess(
	(rawData: unknown) => {
		if (
			!isRecord(rawData) ||
			!('prestashop' in rawData) ||
			!isRecord(rawData.prestashop)
		)
			return rawData;

		const prestashopNode = rawData.prestashop;
		let rawAddresses: unknown[] = [];

		// Step A: Normalization of the address envelope (Single vs Multiple)
		if (
			'addresses' in prestashopNode &&
			isRecord(prestashopNode.addresses) &&
			'address' in prestashopNode.addresses
		) {
			const addresses = prestashopNode.addresses.address;
			rawAddresses = Array.isArray(addresses) ? addresses : [addresses];
		} else if ('address' in prestashopNode) {
			const address = prestashopNode.address;
			rawAddresses = Array.isArray(address) ? address : [address];
		}

		// Step B: Normalization of the lines of each detected address
		const normalizedAddresses = rawAddresses.map((address) => {
			if (!isRecord(address)) return address;
			return PrestashopAddressSchema.parse(address);
		});

		return { addresses: normalizedAddresses };
	},
	z.object({
		addresses: z.array(PrestashopAddressSchema),
	}),
);
export type IPrestashopAddressesResponse = z.infer<
	typeof PrestashopAddressesResponseSchema
>;
