// src/modules/stores/schemas/prestashop/product.schema.ts
import { z } from 'zod';

/** XML Schema for PrestaShop 8.1 Product
 * <?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
<product>
    <id_manufacturer><![CDATA[1]]></id_manufacturer>
    <id_supplier><![CDATA[1]]></id_supplier>
    <id_category_default><![CDATA[1]]></id_category_default>
    <new><![CDATA[1]]></new>
    <id_default_combination><![CDATA[1]]></id_default_combination>
    <id_tax_rules_group><![CDATA[1]]></id_tax_rules_group>
    <type><![CDATA[1]]></type>
    <id_shop_default><![CDATA[1]]></id_shop_default>
    <reference><![CDATA[123456]]></reference>
    <supplier_reference><![CDATA[ABCDEF]]></supplier_reference>
    <ean13><![CDATA[1231231231231]]></ean13>
    <state><![CDATA[1]]></state>
    <product_type><![CDATA[standard]]></product_type>
    <price><![CDATA[123.45]]></price>
    <unit_price><![CDATA[123.45]]></unit_price>
    <active><![CDATA[1]]></active>
    <meta_description>
        <language id="1"><![CDATA[Description]]></language>
    </meta_description>
    <meta_keywords>
        <language id="1"><![CDATA[Keywords]]></language>
    </meta_keywords>
    <meta_title>z.object({
  language: z.array(LanguageValueSchema)
});
        <language id="1"><![CDATA[My Title for SEO]]></language>
    </meta_title>
    <link_rewrite>
        <language id="1"><![CDATA[awesome-product]]></language>
    </link_rewrite>
    <name>
        <language id="1"><![CDATA[My awesome Product]]></language>
    </name>
    <description>
        <language id="1"><![CDATA[Description]]></language>
    </description>
    <description_short>
        <language id="1"><![CDATA[Short description]]></language>
    </description_short>
    <associations>
        <categories>
            <category>
                <id><![CDATA[1]]></id>
            </category>
        </categories>
    </associations>
</product>
</prestashop>

 */

const LanguageValueSchema = z.object({
  // The ID attribute of the language block
  '@_id': z.string().or(z.number()).transform(String),
  
  // The textual content (which will be wrapped in CDATA during conversion)
  '#': z.string().max(255, "La meta-description est trop longue")
});

const MetaDataSchema = z.object({
  language: z.union([LanguageValueSchema, z.array(LanguageValueSchema)])
});

// Helper to create a schema for CDATA content { "#": value }
const cdata = (schema: z.ZodTypeAny) => z.object({
    '#': schema.transform(String)
});

export const PrestaShopProductSchema = z.object({
    id_manufacturer: cdata(z.number()),
    id_supplier: cdata(z.number()),
    id_category_default: cdata(z.number()),
    new: cdata(z.number()),
    id_default_combination: cdata(z.number()),
    id_tax_rules_group: cdata(z.number()),
    type: cdata(z.string()),
    id_shop_default: cdata(z.string()),
    reference: cdata(z.string()),
    supplier_reference: cdata(z.string()),
    ean13: cdata(z.string()),
    state: cdata(z.string()),
    product_type: cdata(z.string()),
    price: cdata(z.number()),
    unit_price: cdata(z.number()),
    active: cdata(z.boolean().transform(v => v ? 1 : 0)),
    meta_description: MetaDataSchema,
    meta_keywords: MetaDataSchema,
    meta_title: MetaDataSchema,
    link_rewrite: MetaDataSchema,
    name: MetaDataSchema,
    description: MetaDataSchema,
    description_short: MetaDataSchema,
    associations: z.object({
        categories: z.object({
            category: z.array(z.object({
                id: cdata(z.number())
            }))
        })
    })
});