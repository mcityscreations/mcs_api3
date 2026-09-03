import z from 'zod';
import { ZodStringToInteger } from '../../../../common/utils/stringToInteger.js';
import { ZodFilterAttribute } from '../../../../common/utils/filterAttribute.utils.js';
import { ZodPriceToCents } from '../../../../common/utils/priceToCents.js';

/**
 * Order schema based on PrestaShop API response structure.
 * @see https://devdocs.prestashop-project.org/9/webservice/resources/orders/
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <order>
        <id><![CDATA[]]></id>
        <id_address_delivery><![CDATA[]]></id_address_delivery>
        <id_address_invoice><![CDATA[]]></id_address_invoice>
        <id_cart><![CDATA[]]></id_cart>
        <id_currency><![CDATA[]]></id_currency>
        <id_lang><![CDATA[]]></id_lang>
        <id_customer><![CDATA[]]></id_customer>
        <id_carrier><![CDATA[]]></id_carrier>
        <current_state><![CDATA[]]></current_state>
        <module><![CDATA[]]></module>
        <invoice_number><![CDATA[]]></invoice_number>
        <invoice_date><![CDATA[]]></invoice_date>
        <delivery_number><![CDATA[]]></delivery_number>
        <delivery_date><![CDATA[]]></delivery_date>
        <valid><![CDATA[]]></valid>
        <date_add><![CDATA[]]></date_add>
        <date_upd><![CDATA[]]></date_upd>
        <shipping_number><![CDATA[]]></shipping_number>
        <note><![CDATA[]]></note>
        <id_shop_group><![CDATA[]]></id_shop_group>
        <id_shop><![CDATA[]]></id_shop>
        <secure_key><![CDATA[]]></secure_key>
        <payment><![CDATA[]]></payment>
        <recyclable><![CDATA[]]></recyclable>
        <gift><![CDATA[]]></gift>
        <gift_message><![CDATA[]]></gift_message>
        <mobile_theme><![CDATA[]]></mobile_theme>
        <total_discounts><![CDATA[]]></total_discounts>
        <total_discounts_tax_incl><![CDATA[]]></total_discounts_tax_incl>
        <total_discounts_tax_excl><![CDATA[]]></total_discounts_tax_excl>
        <total_paid><![CDATA[]]></total_paid>
        <total_paid_tax_incl><![CDATA[]]></total_paid_tax_incl>
        <total_paid_tax_excl><![CDATA[]]></total_paid_tax_excl>
        <total_paid_real><![CDATA[]]></total_paid_real>
        <total_products><![CDATA[]]></total_products>
        <total_products_wt><![CDATA[]]></total_products_wt>
        <total_shipping><![CDATA[]]></total_shipping>
        <total_shipping_tax_incl><![CDATA[]]></total_shipping_tax_incl>
        <total_shipping_tax_excl><![CDATA[]]></total_shipping_tax_excl>
        <carrier_tax_rate><![CDATA[]]></carrier_tax_rate>
        <total_wrapping><![CDATA[]]></total_wrapping>
        <total_wrapping_tax_incl><![CDATA[]]></total_wrapping_tax_incl>
        <total_wrapping_tax_excl><![CDATA[]]></total_wrapping_tax_excl>
        <round_mode><![CDATA[]]></round_mode>
        <round_type><![CDATA[]]></round_type>
        <conversion_rate><![CDATA[]]></conversion_rate>
        <reference><![CDATA[]]></reference>
        <associations>
        <order_rows>
            <order_row>
            <id><![CDATA[]]></id>
            <product_id><![CDATA[]]></product_id>
            <product_attribute_id><![CDATA[]]></product_attribute_id>
            <product_quantity><![CDATA[]]></product_quantity>
            <product_name><![CDATA[]]></product_name>
            <product_reference><![CDATA[]]></product_reference>
            <product_ean13><![CDATA[]]></product_ean13>
            <product_isbn><![CDATA[]]></product_isbn>
            <product_upc><![CDATA[]]></product_upc>
            <product_price><![CDATA[]]></product_price>
            <id_customization><![CDATA[]]></id_customization>
            <unit_price_tax_incl><![CDATA[]]></unit_price_tax_incl>
            <unit_price_tax_excl><![CDATA[]]></unit_price_tax_excl>
            </order_row>
        </order_rows>
        </associations>
    </order>
    </prestashop>

 */

export const OrderRowSchema = z.object({
	id: ZodStringToInteger,
	product_id: ZodStringToInteger,
	product_attribute_id: ZodStringToInteger,
	product_quantity: ZodStringToInteger,
	product_name: z.string().nullable().optional(),
	product_reference: z.string().nullable().optional(),
	product_ean13: z.string().nullable().optional(),
	product_isbn: z.string().nullable().optional(),
	product_upc: z.string().nullable().optional(),
	product_price: ZodPriceToCents,
	id_customization: ZodStringToInteger,
	unit_price_tax_incl: ZodPriceToCents,
	unit_price_tax_excl: ZodPriceToCents,
});
export type IOrderRowSchema = z.infer<typeof OrderRowSchema>;

export const PrestashopOrderSchema = z.object({
	id: ZodStringToInteger.nullable().optional(),
	id_address_delivery: ZodStringToInteger,
	id_address_invoice: ZodStringToInteger,
	id_cart: ZodStringToInteger,
	id_currency: ZodStringToInteger,
	id_lang: ZodStringToInteger,
	id_customer: ZodStringToInteger,
	id_carrier: ZodStringToInteger,
	current_state: ZodStringToInteger.nullable().optional(),
	module: z.string(),
	invoice_number: ZodStringToInteger.nullable().optional(),
	invoice_date: z.string().nullable().optional(),
	delivery_number: ZodStringToInteger.nullable().optional(),
	delivery_date: z.string().nullable().optional(),
	valid: z.number().nullable().optional(),
	date_add: z.string().nullable().optional(),
	date_upd: z.string().nullable().optional(),
	shipping_number: ZodFilterAttribute.nullable().optional(),
	note: z.string().nullable().optional(),
	id_shop_group: z.number().nullable().optional(),
	id_shop: z.number().nullable().optional(),
	secure_key: z.string().nullable().optional(),
	payment: z.string(),
	recyclable: ZodStringToInteger.nullable().optional(),
	gift: ZodStringToInteger.nullable().optional(),
	gift_message: z.string().nullable().optional(),
	mobile_theme: ZodStringToInteger.nullable().optional(),
	total_discounts: ZodPriceToCents.nullable().optional(),
	total_discounts_tax_incl: ZodPriceToCents.nullable().optional(),
	total_discounts_tax_excl: ZodPriceToCents.nullable().optional(),
	total_paid: ZodPriceToCents.nullable().optional(),
	total_paid_tax_incl: ZodPriceToCents.nullable().optional(),
	total_paid_tax_excl: ZodPriceToCents.nullable().optional(),
	total_paid_real: ZodPriceToCents.nullable().optional(),
	total_products: ZodPriceToCents.nullable().optional(),
	total_products_wt: ZodPriceToCents.nullable().optional(),
	total_shipping: ZodPriceToCents.nullable().optional(),
	total_shipping_tax_incl: ZodPriceToCents.nullable().optional(),
	total_shipping_tax_excl: ZodPriceToCents.nullable().optional(),
	carrier_tax_rate: ZodPriceToCents.nullable().optional(),
	total_wrapping: ZodPriceToCents.nullable().optional(),
	total_wrapping_tax_incl: ZodPriceToCents.nullable().optional(),
	total_wrapping_tax_excl: ZodPriceToCents.nullable().optional(),
	round_mode: ZodPriceToCents.nullable().optional(),
	round_type: z.number().nullable().optional(),
	conversion_rate: z.number().nullable().optional(),
	reference: z.string().nullable().optional(),
	associations: z.object({
		order_rows: z.preprocess((val: unknown) => {
			if (!val || typeof val !== 'object') return [];

			const node = val as Record<string, unknown>;
			// Extracting the property `order_row` from `order_rows`
			const rawRows: IOrderRowSchema = node['order_row'] ?? node;

			// Normalizing : Always return an array
			if (Array.isArray(rawRows)) return rawRows;
			if (rawRows && typeof rawRows === 'object') return [rawRows];

			return [];
		}, z.array(OrderRowSchema)),
	}),
});

export type IPrestashopOrder = z.infer<typeof PrestashopOrderSchema>;

// Reusable TypeScript type guards
function isRecord(val: unknown): val is Record<string, unknown> {
	return typeof val === 'object' && val !== null;
}

export const PrestashopOrdersResponseSchema = z.preprocess(
	(rawData: unknown) => {
		if (
			!isRecord(rawData) ||
			!('prestashop' in rawData) ||
			!isRecord(rawData.prestashop)
		)
			return rawData;

		const prestashopNode = rawData.prestashop;
		let rawOrders: unknown[] = [];

		// Step A: Normalization of the order envelope (Single vs Multiple)
		if (
			'orders' in prestashopNode &&
			isRecord(prestashopNode.orders) &&
			'order' in prestashopNode.orders
		) {
			const orders = prestashopNode.orders.order;
			rawOrders = Array.isArray(orders) ? orders : [orders];
		} else if ('order' in prestashopNode) {
			const order = prestashopNode.order;
			rawOrders = Array.isArray(order) ? order : [order];
		}

		// Step B: Normalization of the lines of each detected credit note
		const normalizedOrders = rawOrders.map((order) => {
			if (!isRecord(order)) return order;

			let normalizedItems: unknown[] = [];

			// Descend into associations -> order_slip_details -> order_slip_detail
			if (
				'associations' in order &&
				isRecord(order.associations) &&
				'order_rows' in order.associations &&
				isRecord(order.associations.order_rows) &&
				'order_row' in order.associations.order_rows
			) {
				const orderRows = order.associations.order_rows.order_row;
				normalizedItems = Array.isArray(orderRows) ? orderRows : [orderRows];
			}

			// Extract items at the top level to simplify mapping
			return {
				...order,
				items: normalizedItems,
			};
		});

		return { orders: normalizedOrders };
	},
	z.object({
		orders: z.array(PrestashopOrderSchema),
	}),
);

export type IPrestashopOrderList = z.infer<
	typeof PrestashopOrdersResponseSchema
>;
