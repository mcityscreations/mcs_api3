//src/modules/stores/schemas/prestashop/customer.schema.ts
import { z } from 'zod';

/**
 * 
	@see https://devdocs.prestashop-project.org/9/webservice/resources/customers/
	<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
		<customers>
		<customer>
				<id><![CDATA[5]]></id>
				<id_default_group xlink:href="https://mcitys.fr/api/groups/3"><![CDATA[3]]></id_default_group>
				<id_lang xlink:href="https://mcitys.fr/api/languages/2"><![CDATA[2]]></id_lang>
				<newsletter_date_add><![CDATA[0000-00-00 00:00:00]]></newsletter_date_add>
				<ip_registration_newsletter><![CDATA[]]></ip_registration_newsletter>
				<last_passwd_gen><![CDATA[2023-10-20 13:10:53]]></last_passwd_gen>
				<secure_key><![CDATA[e5646e3e233648d06231e82e429076f8]]></secure_key>
				<deleted><![CDATA[0]]></deleted>
				<passwd><![CDATA[$2y$10$AOkyMKJc7eEe1XIu.Ubv6O5trepAR0K.lglaoCpurqGu36NWV8nly]]></passwd>
				<lastname><![CDATA[Strout]]></lastname>
				<firstname><![CDATA[Lea]]></firstname>
				<email><![CDATA[contact@mcitys.com]]></email>
				<id_gender><![CDATA[2]]></id_gender>
				<birthday><![CDATA[0000-00-00]]></birthday>
				<newsletter><![CDATA[0]]></newsletter>
				<optin><![CDATA[0]]></optin>
				<website><![CDATA[]]></website>
				<company><![CDATA[]]></company>
				<siret><![CDATA[]]></siret>
				<ape><![CDATA[]]></ape>
				<outstanding_allow_amount><![CDATA[0.000000]]></outstanding_allow_amount>
				<show_public_prices><![CDATA[0]]></show_public_prices>
				<id_risk><![CDATA[1]]></id_risk>
				<max_payment_days><![CDATA[0]]></max_payment_days>
				<active><![CDATA[1]]></active>
				<note><![CDATA[]]></note>
				<is_guest><![CDATA[0]]></is_guest>
				<id_shop><![CDATA[1]]></id_shop>
				<id_shop_group><![CDATA[1]]></id_shop_group>
				<date_add><![CDATA[2023-10-20 21:10:53]]></date_add>
				<date_upd><![CDATA[2023-10-24 20:42:26]]></date_upd>
				<reset_password_token><![CDATA[]]></reset_password_token>
				<reset_password_validity><![CDATA[0000-00-00 00:00:00]]></reset_password_validity>
		<associations>
		<groups nodeType="group" api="groups">
				<group xlink:href="https://mcitys.fr/api/groups/3">
				<id><![CDATA[3]]></id>
				</group>
		</groups>
		</associations>
		</customer>
		</customers>
	</prestashop>

	Prestashop customer groups:
	1 - Visitor
	2 - Guest
	3 - Customer
	4 - Professional France
	5 - Professional International
 */

export const PrestashopCustomerSchema = z.object({
	id: z.number().nullable().optional(),
	id_default_group: z.number().nullable().optional(),
	id_lang: z.number().nullable().optional(),
	newsletter_date_add: z.string().nullable().optional(),
	ip_registration_newsletter: z.string().nullable().optional(),
	last_passwd_gen: z.string().nullable().optional(),
	secure_key: z.string().nullable().optional(),
	deleted: z.number().nullable().optional(),
	passwd: z.string(),
	lastname: z.string(),
	firstname: z.string(),
	email: z.email(),
	id_gender: z.number().nullable().optional(),
	birthday: z.string().nullable().optional(),
	newsletter: z.number().nullable().optional(),
	optin: z.number().nullable().optional(),
	website: z.string().nullable().optional(),
	company: z.string().nullable().optional(),
	siret: z.string().nullable().optional(),
	ape: z.string().nullable().optional(),
	outstanding_allow_amount: z.number().nullable().optional(),
	show_public_prices: z.number().nullable().optional(),
	id_risk: z.number().nullable().optional(),
	max_payment_days: z.number().nullable().optional(),
	active: z.number().nullable().optional(),
	note: z.string().nullable().optional(),
	is_guest: z.number().nullable().optional(),
	id_shop: z.number().nullable().optional(),
	id_shop_group: z.number().nullable().optional(),
	date_add: z.string().nullable().optional(),
	date_upd: z.string().nullable().optional(),
	reset_password_token: z.string().nullable().optional(),
	reset_password_validity: z.string().nullable().optional(),
	groups: z.array(
		z.object({
			id: z.number(),
		}),
	),
});
export type IPrestashopCustomer = z.infer<typeof PrestashopCustomerSchema>;

// Reusable TypeScript type guards
function isRecord(val: unknown): val is Record<string, unknown> {
	return typeof val === 'object' && val !== null;
}

export const PrestashopCustomersResponseSchema = z.preprocess(
	(rawData: unknown) => {
		if (
			!isRecord(rawData) ||
			!('prestashop' in rawData) ||
			!isRecord(rawData.prestashop)
		)
			return rawData;

		const prestashopNode = rawData.prestashop;
		let rawCustomers: unknown[] = [];

		// Step A: Normalization of the customer envelope (Single vs Multiple)
		if (
			'customers' in prestashopNode &&
			isRecord(prestashopNode.customers) &&
			'customer' in prestashopNode.customers
		) {
			const customers = prestashopNode.customers.customer;
			rawCustomers = Array.isArray(customers) ? customers : [customers];
		} else if ('customer' in prestashopNode) {
			const customer = prestashopNode.customer;
			rawCustomers = Array.isArray(customer) ? customer : [customer];
		}

		// Step B: Normalization of the lines of each detected credit note
		const normalizedCustomers = rawCustomers.map((customer) => {
			if (!isRecord(customer)) return customer;

			let normalizedItems: unknown[] = [];

			// Descend into associations -> order_slip_details -> order_slip_detail
			if (
				'associations' in customer &&
				isRecord(customer.associations) &&
				'groups' in customer.associations &&
				isRecord(customer.associations.groups) &&
				'group' in customer.associations.groups
			) {
				const groups = customer.associations.groups.group;
				normalizedItems = Array.isArray(groups) ? groups : [groups];
			}

			// Extract items at the top level to simplify mapping
			return {
				...customer,
				items: normalizedItems,
			};
		});

		return { customers: normalizedCustomers };
	},
	z.object({
		customers: z.array(PrestashopCustomerSchema),
	}),
);

export type PrestashopCustomersNormalized = z.infer<
	typeof PrestashopCustomersResponseSchema
>;
