import { z } from 'zod';
import { ZodStringToInteger } from '../../../../common/utils/stringToInteger.js';
import { ZodPriceToCents } from '../../../../common/utils/priceToCents.js';
/**
 * 
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
<order_payments>
<order_payment>
        <id><![CDATA[31]]></id>
        <order_reference><![CDATA[XISBPMJUP]]></order_reference>
        <id_currency><![CDATA[1]]></id_currency>
        <amount><![CDATA[2.500000]]></amount>
        <payment_method><![CDATA[Card]]></payment_method>
        <conversion_rate><![CDATA[1.000000]]></conversion_rate>
        <transaction_id><![CDATA[9KM949292D785454N]]></transaction_id>
        <card_number><![CDATA[]]></card_number>
        <card_brand><![CDATA[]]></card_brand>
        <card_expiration><![CDATA[]]></card_expiration>
        <card_holder><![CDATA[]]></card_holder>
        <date_add><![CDATA[2026-10-17 13:49:36]]></date_add>
        <id_employee><![CDATA[]]></id_employee>
</order_payment>
</order_payments>
</prestashop>
 */

export const PrestashopPaymentSchema = z.object({
	id: z.coerce.string().optional(),
	order_reference: z.coerce.string(),
	id_currency: z.number(),
	amount: ZodPriceToCents,
	payment_method: z.string(),
	conversion_rate: ZodStringToInteger,
	transaction_id: z.string().optional(),
	card_number: z.coerce.string().optional(),
	card_brand: z.string().optional(),
	card_expiration: z.string().optional(),
	card_holder: z.string().optional(),
	date_add: z.string().optional(),
	id_employee: z.string().optional(),
});
export type IPrestashopPayment = z.infer<typeof PrestashopPaymentSchema>;

export const PrestashopPaymentListSchema = z.object({
	prestashop: z.object({
		order_payments: z.object({
			order_payment: z
				.preprocess(
					(val): unknown[] => (Array.isArray(val) ? val : [val]),
					z.array(PrestashopPaymentSchema),
				)
				.optional()
				.default([]),
		}),
	}),
});
export type IPrestashopPaymentListSchema = z.infer<
	typeof PrestashopPaymentListSchema
>;

export const PrestashopSinglePaymentSchema = z.object({
	prestashop: z.object({
		order_payment: z
			.preprocess(
				(val): unknown[] => (Array.isArray(val) ? val : [val]),
				z.array(PrestashopPaymentSchema),
			)
			.optional()
			.default([]),
	}),
});
export type IPrestashopSinglePayment = z.infer<
	typeof PrestashopSinglePaymentSchema
>;
