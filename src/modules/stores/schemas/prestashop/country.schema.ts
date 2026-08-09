import { z } from 'zod';
/**
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <country>
    <id><![CDATA[]]></id>
    <id_zone><![CDATA[]]></id_zone>
    <id_currency><![CDATA[]]></id_currency>
    <call_prefix><![CDATA[]]></call_prefix>
    <iso_code><![CDATA[]]></iso_code>
    <active><![CDATA[]]></active>
    <contains_states><![CDATA[]]></contains_states>
    <need_identification_number><![CDATA[]]></need_identification_number>
    <need_zip_code><![CDATA[]]></need_zip_code>
    <zip_code_format><![CDATA[]]></zip_code_format>
    <display_tax_label><![CDATA[]]></display_tax_label>
    <name>
      <language id="1"><![CDATA[]]></language>
      <language id="2"><![CDATA[]]></language>
    </name>
  </country>
</prestashop>

 */

export const PrestashopCountrySchema = z.object({
	id: z.string().transform(Number).or(z.number()).nullable().optional(),
	id_zone: z.string().transform(Number).or(z.number()).nullable().optional(),
	id_currency: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	call_prefix: z.string().nullable().optional(),
	iso_code: z.string().nullable().optional(),
	active: z.string().transform(Number).or(z.number()).nullable().optional(),
	contains_states: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	need_identification_number: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	need_zip_code: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	zip_code_format: z.string().nullable().optional(),
	display_tax_label: z
		.string()
		.transform(Number)
		.or(z.number())
		.nullable()
		.optional(),
	name: z.object({
		language: z
			.array(
				z.object({
					id: z.string().transform(Number).or(z.number()).nullable().optional(),
					value: z.string().nullable().optional(),
				}),
			)
			.nullable()
			.optional(),
	}),
});

export const PrestashopCountryListSchema = z.object({
	prestashop: z.object({
		country: z
			.preprocess(
				(val): unknown[] => (Array.isArray(val) ? val : [val]),
				z.array(PrestashopCountrySchema),
			)
			.optional()
			.default([]),
	}),
});
export type IPrestashopCountry = z.infer<typeof PrestashopCountrySchema>;
export type IPrestashopCountryList = z.infer<
	typeof PrestashopCountryListSchema
>;
