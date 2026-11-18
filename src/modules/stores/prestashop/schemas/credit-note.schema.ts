import { z } from 'zod';

// Helper to validate and convert SQL date to Timestamp in milliseconds
const prestashopDateTimeToTimestamp = z.preprocess((val) => {
	if (
		typeof val !== 'string' ||
		val.trim() === '' ||
		val.startsWith('0000-00-00')
	)
		return null;
	const date = new Date(val.replace(' ', 'T')); // Conversion in partial ISO format for the Date constructor
	return Number.isNaN(date.getTime()) ? null : date.getTime();
}, z.number().int().positive());

// Reusable TypeScript type guards
function isRecord(val: unknown): val is Record<string, unknown> {
	return typeof val === 'object' && val !== null;
}

// 1. Schema for a credit note line (Refunded item)
const PrestashopOrderSlipDetailSchema = z.object({
	id: z.string().min(1),
	id_order_detail: z.string().min(1), // Direct link to the original order line (e.g., 53)
	product_quantity: z.preprocess(
		(val) => Number.parseInt(val as string, 10),
		z.number().int().positive(),
	),

	// Line amounts converted to cents
	amount_tax_excl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
	amount_tax_incl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
});

// 2. Schema for a normalized credit note
const PrestashopOrderSlipSchema = z.object({
	id: z.string().min(1),
	id_customer: z.string().min(1),
	id_order: z.string().min(1),

	// Global totals of the credit note converted to cents
	total_products_tax_excl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
	total_products_tax_incl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
	total_shipping_tax_excl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
	total_shipping_tax_incl: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	),
	amount: z.preprocess(
		(val) => Math.round(Number.parseFloat(val as string) * 100),
		z.number().int().nonnegative(),
	), // Total refunded amount

	// Conversion of the date to Unix timestamp (Perfect for your pivot model)
	date_add: prestashopDateTimeToTimestamp,
	date_upd: prestashopDateTimeToTimestamp,

	order_slip_type: z.string(),

	// Normalization of nested credit note lines
	items: z.array(PrestashopOrderSlipDetailSchema),
});

// 3. Global processor for the API response
export const PrestashopOrderSlipsResponseSchema = z.preprocess(
	(rawData: unknown) => {
		if (
			!isRecord(rawData) ||
			!('prestashop' in rawData) ||
			!isRecord(rawData.prestashop)
		)
			return rawData;

		const prestashopNode = rawData.prestashop;
		let rawSlips: unknown[] = [];

		// Step A: Normalization of the credit note envelope (Single vs Multiple)
		if (
			'order_slips' in prestashopNode &&
			isRecord(prestashopNode.order_slips) &&
			'order_slip' in prestashopNode.order_slips
		) {
			const slips = prestashopNode.order_slips.order_slip;
			rawSlips = Array.isArray(slips) ? slips : [slips];
		} else if ('order_slip' in prestashopNode) {
			const slip = prestashopNode.order_slip;
			rawSlips = Array.isArray(slip) ? slip : [slip];
		}

		// Step B: Normalization of the lines of each detected credit note
		const normalizedSlips = rawSlips.map((slip) => {
			if (!isRecord(slip)) return slip;

			let normalizedItems: unknown[] = [];

			// Descend into associations -> order_slip_details -> order_slip_detail
			if (
				'associations' in slip &&
				isRecord(slip.associations) &&
				'order_slip_details' in slip.associations &&
				isRecord(slip.associations.order_slip_details) &&
				'order_slip_detail' in slip.associations.order_slip_details
			) {
				const details =
					slip.associations.order_slip_details.order_detail ||
					slip.associations.order_slip_details.order_slip_detail;
				normalizedItems = Array.isArray(details) ? details : [details];
			}

			// Extract items at the top level to simplify mapping
			return {
				...slip,
				items: normalizedItems,
			};
		});

		return { slips: normalizedSlips };
	},
	z.object({
		slips: z.array(PrestashopOrderSlipSchema),
	}),
);

export type PrestashopOrderSlipsNormalized = z.infer<
	typeof PrestashopOrderSlipsResponseSchema
>;
