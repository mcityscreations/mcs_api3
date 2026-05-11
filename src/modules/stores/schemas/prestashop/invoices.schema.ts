import { z } from 'zod';

/** XML Schema for PrestaShop 8.1 Invoice
 * <?xml version="1.0" encoding="UTF-8"?>
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_invoice>
    <id><![CDATA[]]></id>
    <id_order><![CDATA[]]></id_order>
    <number><![CDATA[]]></number>
    <delivery_number><![CDATA[]]></delivery_number>
    <delivery_date><![CDATA[]]></delivery_date>
    <total_discount_tax_excl><![CDATA[]]></total_discount_tax_excl>
    <total_discount_tax_incl><![CDATA[]]></total_discount_tax_incl>
    <total_paid_tax_excl><![CDATA[]]></total_paid_tax_excl>
    <total_paid_tax_incl><![CDATA[]]></total_paid_tax_incl>
    <total_products><![CDATA[]]></total_products>
    <total_products_wt><![CDATA[]]></total_products_wt>
    <total_shipping_tax_excl><![CDATA[]]></total_shipping_tax_excl>
    <total_shipping_tax_incl><![CDATA[]]></total_shipping_tax_incl>
    <shipping_tax_computation_method><![CDATA[]]></shipping_tax_computation_method>
    <total_wrapping_tax_excl><![CDATA[]]></total_wrapping_tax_excl>
    <total_wrapping_tax_incl><![CDATA[]]></total_wrapping_tax_incl>
    <shop_address><![CDATA[]]></shop_address>
    <note><![CDATA[]]></note>
    <date_add><![CDATA[]]></date_add>
  </order_invoice>
</prestashop>

 */

/** PrestaShop 8.1 API returns a list of invoices in this format:
 * <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
      <order_invoices>
        <order_invoice id="3" xlink:href="https://mcitys.fr/api/order_invoices/3"/>
        <order_invoice id="1" xlink:href="https://mcitys.fr/api/order_invoices/1"/>
      </order_invoices>
    </prestashop>
 */

export const PrestashopInvoiceSchema = z.object({
	id: z.number().optional(),
	id_order: z.number(),
	number: z.number(),
	delivery_number: z.number().optional(),
	delivery_date: z.string().optional(),
	total_discount_tax_excl: z.number().optional(),
	total_discount_tax_incl: z.number().optional(),
	total_paid_tax_excl: z.number().optional(),
	total_paid_tax_incl: z.number().optional(),
	total_products: z.number().optional(),
	total_products_wt: z.number().optional(),
	total_shipping_tax_excl: z.number().optional(),
	total_shipping_tax_incl: z.number().optional(),
	shipping_tax_computation_method: z.string().optional(),
	total_wrapping_tax_excl: z.number().optional(),
	total_wrapping_tax_incl: z.number().optional(),
	shop_address: z.string().max(1000).optional(),
	note: z.string().max(65000).optional(),
	date_add: z.string().optional(),
});
export type IPrestashopInvoice = z.infer<typeof PrestashopInvoiceSchema>;

export const PrestashopInvoiceListSchema = z.object({
  prestashop: z.object({
    order_invoices: z.object({
      // If there is only one invoice, Prestashop will return an object 
      // instead of an array of objects. For an easier data parsing, it's 
      // better to store a single object into an array.
      order_invoice: z.preprocess(
        (val) => (Array.isArray(val) ? val : [val]),
        z.array(
          z.object({
            id: z.coerce.number(), // Extracting XML attribute ID
            "xlink:href": z.url(),
          })
        )
      ),
    }),
  }),
});
export type IPrestashopInvoiceList = z.infer<typeof PrestashopInvoiceListSchema>;

export const PrestashopInvoiceIDSchema = z.object({
  invoiceID: z.coerce.number(), // Using .coerce to transform the type of the param from string to number
});
export type IPrestashopInvoiceID = z.infer<typeof PrestashopInvoiceIDSchema>;