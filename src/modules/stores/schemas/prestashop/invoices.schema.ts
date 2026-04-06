import { z } from 'zod';

/**
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
  date_add: z.string().optional()
});

export type IPrestashopInvoice = z.infer<typeof PrestashopInvoiceSchema>;