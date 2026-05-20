import z from 'zod';

/**
 * @see https://devdocs.prestashop-project.org/9/webservice/resources/order_details/
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_detail>
    <id><![CDATA[]]></id>
    <id_order><![CDATA[]]></id_order>
    <product_id><![CDATA[]]></product_id>
    <product_attribute_id><![CDATA[]]></product_attribute_id>
    <product_quantity_reinjected><![CDATA[]]></product_quantity_reinjected>
    <group_reduction><![CDATA[]]></group_reduction>
    <discount_quantity_applied><![CDATA[]]></discount_quantity_applied>
    <download_hash><![CDATA[]]></download_hash>
    <download_deadline><![CDATA[]]></download_deadline>
    <id_order_invoice><![CDATA[]]></id_order_invoice>
    <id_warehouse><![CDATA[]]></id_warehouse>
    <id_shop><![CDATA[]]></id_shop>
    <id_customization><![CDATA[]]></id_customization>
    <product_name><![CDATA[]]></product_name>
    <product_quantity><![CDATA[]]></product_quantity>
    <product_quantity_in_stock><![CDATA[]]></product_quantity_in_stock>
    <product_quantity_return><![CDATA[]]></product_quantity_return>
    <product_quantity_refunded><![CDATA[]]></product_quantity_refunded>
    <product_price><![CDATA[]]></product_price>
    <reduction_percent><![CDATA[]]></reduction_percent>
    <reduction_amount><![CDATA[]]></reduction_amount>
    <reduction_amount_tax_incl><![CDATA[]]></reduction_amount_tax_incl>
    <reduction_amount_tax_excl><![CDATA[]]></reduction_amount_tax_excl>
    <product_quantity_discount><![CDATA[]]></product_quantity_discount>
    <product_ean13><![CDATA[]]></product_ean13>
    <product_isbn><![CDATA[]]></product_isbn>
    <product_upc><![CDATA[]]></product_upc>
    <product_mpn><![CDATA[]]></product_mpn>
    <product_reference><![CDATA[]]></product_reference>
    <product_supplier_reference><![CDATA[]]></product_supplier_reference>
    <product_weight><![CDATA[]]></product_weight>
    <tax_computation_method><![CDATA[]]></tax_computation_method>
    <id_tax_rules_group><![CDATA[]]></id_tax_rules_group>
    <ecotax><![CDATA[]]></ecotax>
    <ecotax_tax_rate><![CDATA[]]></ecotax_tax_rate>
    <download_nb><![CDATA[]]></download_nb>
    <unit_price_tax_incl><![CDATA[]]></unit_price_tax_incl>
    <unit_price_tax_excl><![CDATA[]]></unit_price_tax_excl>
    <total_price_tax_incl><![CDATA[]]></total_price_tax_incl>
    <total_price_tax_excl><![CDATA[]]></total_price_tax_excl>
    <total_shipping_price_tax_excl><![CDATA[]]></total_shipping_price_tax_excl>
    <total_shipping_price_tax_incl><![CDATA[]]></total_shipping_price_tax_incl>
    <purchase_supplier_price><![CDATA[]]></purchase_supplier_price>
    <original_product_price><![CDATA[]]></original_product_price>
    <original_wholesale_price><![CDATA[]]></original_wholesale_price>
    <total_refunded_tax_excl><![CDATA[]]></total_refunded_tax_excl>
    <total_refunded_tax_incl><![CDATA[]]></total_refunded_tax_incl>
    <associations>
      <taxes>
        <tax>
          <id><![CDATA[]]></id>
        </tax>
      </taxes>
    </associations>
  </order_detail>
</prestashop>

 */

// Helper to convert decimal price strings from PrestaShop into integer cents (e.g. "12.34" -> 1234)
const prestashopPriceToCents = z.preprocess((val) => {
	if (typeof val !== 'string' || val.trim() === '') return 0;
	const floatValue = parseFloat(val);
	return isNaN(floatValue) ? 0 : Math.round(floatValue * 100);
}, z.number().int().nonnegative());

// Helper to convert numeric strings into integers (e.g. "2" -> 2)
const stringToInteger = z.preprocess((val) => {
	if (typeof val !== 'string' || val.trim() === '') return 0;
	const intValue = parseInt(val, 10);
	return isNaN(intValue) ? 0 : intValue;
}, z.number().int().nonnegative());

// Helper to handle PrestaShop "zero" dates
const prestashopDateOrNull = z.preprocess((val) => {
	if (typeof val !== 'string' || val.startsWith('0000-00-00')) return null;
	return val;
}, z.string().nullable());

export const PrestashopOrderItemSchema = z.object({
	// Technical and association fields
	id: z.string().min(1),
	id_order: z.string().min(1),
	product_id: z.string().min(1),
	product_attribute_id: stringToInteger,
	id_order_invoice: z.string().nullable().optional(),
	id_warehouse: stringToInteger,
	id_shop: stringToInteger,
	id_customization: stringToInteger,

	// Product information
	product_name: z.string().min(1),
	product_reference: z.string().nullable().optional(),
	product_supplier_reference: z.string().nullable().optional(),
	product_ean13: z.string().nullable().optional(),
	product_isbn: z.string().nullable().optional(),
	product_upc: z.string().nullable().optional(),
	product_mpn: z.string().nullable().optional(),
	product_weight: stringToInteger.optional(), // Often a float in string, optional here

	// Quantities (Converted to strict Integers)
	product_quantity: stringToInteger,
	product_quantity_in_stock: stringToInteger,
	product_quantity_reinjected: stringToInteger,
	product_quantity_return: stringToInteger,
	product_quantity_refunded: stringToInteger,

	// Unit prices (Converted to CENTS at parse time)
	product_price: prestashopPriceToCents,
	unit_price_tax_excl: prestashopPriceToCents,
	unit_price_tax_incl: prestashopPriceToCents,
	purchase_supplier_price: prestashopPriceToCents,
	original_product_price: prestashopPriceToCents,
	original_wholesale_price: prestashopPriceToCents,

	// Discounts
	reduction_percent: prestashopPriceToCents, //conversion to PBS later
	reduction_amount: prestashopPriceToCents,
	reduction_amount_tax_excl: prestashopPriceToCents,
	reduction_amount_tax_incl: prestashopPriceToCents,
	group_reduction: z.string().optional(),
	discount_quantity_applied: stringToInteger,
	product_quantity_discount: stringToInteger,

	// Line totals (Converted to CENTS)
	total_price_tax_excl: prestashopPriceToCents,
	total_price_tax_incl: prestashopPriceToCents,
	total_shipping_price_tax_excl: prestashopPriceToCents,
	total_shipping_price_tax_incl: prestashopPriceToCents,
	total_refunded_tax_excl: prestashopPriceToCents,
	total_refunded_tax_incl: prestashopPriceToCents,

	// Taxes
	tax_computation_method: stringToInteger,
	id_tax_rules_group: stringToInteger,
	ecotax: prestashopPriceToCents,
	ecotax_tax_rate: z.string().optional(),

	// Downloads (virtual products)
	download_hash: z.string().nullable().optional(),
	download_deadline: prestashopDateOrNull.nullable().optional(),
	download_nb: stringToInteger,

	// Associations (Taxes applied to this line)
	associations: z
		.object({
			taxes: z
				.object({
					tax: z
						.union([
							z.object({ id: z.string() }),
							z.array(z.object({ id: z.string() })),
						]) // Can be a single tax object or an array of tax objects
						.optional(),
				})
				.optional(),
		})
		.optional(),
});

/** Huge transformations required here because Prestashop API responses are inconsistent.
 *  There is no Array type in XML. To compensate, in case there are multiple items,
 *  Prestashop encapsulates items into an "<order_details>" block. The following code normalizes
 * the structure for consistent processing. We will always end up with an array of items,
 * even if there is only one item in the order.
 */
export const PrestashopOrderDetailsResponseSchema = z.preprocess(
	(rawData: unknown) => {
		// Étape de normalisation avant validation
		if (
			!rawData ||
			typeof rawData !== 'object' ||
			rawData === null ||
			!('prestashop' in rawData) ||
			!rawData.prestashop
		)
			return rawData;

		const prestashopNode = rawData.prestashop;
		let normalizedItems: any[] = [];

		// Option A : There are multiple items (<order_details><order_detail>...)
		if (
			typeof prestashopNode === 'object' &&
			prestashopNode !== null &&
			'order_details' in prestashopNode &&
			prestashopNode.order_details &&
			typeof prestashopNode.order_details === 'object' &&
			'order_detail' in prestashopNode.order_details
		) {
			const details = prestashopNode.order_details.order_detail;
			normalizedItems = Array.isArray(details) ? details : [details];
		}
		// Option B : There is only one item (<order_detail>)
		else if (
			typeof prestashopNode === 'object' &&
			prestashopNode !== null &&
			'order_detail' in prestashopNode
		) {
			const detail = prestashopNode.order_detail;
			normalizedItems = Array.isArray(detail) ? detail : [detail];
		}

		// Reconstruct a clean object for Zod
		return {
			items: normalizedItems,
		};
	},
	z.object({
		// Zod now validates a consistently predictable array of items
		items: z.array(PrestashopOrderItemSchema),
	}),
);

export type IPrestashopOrderDetailsNormalized = z.infer<
	typeof PrestashopOrderDetailsResponseSchema
>;
