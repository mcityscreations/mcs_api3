import { Injectable } from '@nestjs/common';
import { PostgreSQLService } from '../../../system/database/postgresql/postgresql.service.js';
import type { ICreateMcitysInvoice, IMcitysInvoice } from '../schemas/mcitys/invoice.schema.js';

@Injectable()
export class AccountingRepository {
	constructor(private readonly dbService: PostgreSQLService) {}

	public async doesInvoiceExist({
		reference,
		systemSource,
	}: {
		reference: string;
		systemSource: string;
	}): Promise<boolean> {
		const sqlRequest = `
            SELECT EXISTS (
                SELECT 1 
                FROM accounting.invoice 
                WHERE reference = $1 AND system_source = $2
            ) as "exists";
        `;
		const result = await this.dbService.execute<{ exists: boolean }>(
			sqlRequest,
			[reference, systemSource],
			'standard',
		);
		return result.length > 0 ? result[0].exists : false;
	}

	public async saveInvoice(
		data: ICreateMcitysInvoice,
		items: string,
	): Promise<number | null> {
		console.log(data);
		const sqlRequest = `
		WITH
		emitter_data AS (
			SELECT content.people.id_person AS id_emitter
			FROM content.people
			WHERE content.people.id_public = $10
		),
		recipient_data AS (
			SELECT content.people.id_person AS id_recipient
			FROM content.people
			WHERE content.people.id_public = $11
		),
		new_invoice AS (
		INSERT INTO accounting.invoice 
			(system_source, reference, id_technical_erp, amount_wt, amount_vat, amount_at, 
			issue_date, due_date, paid_at, emitter, recipient, currency, payment_direction, invoice_type, id_order
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
			(SELECT id_emitter FROM emitter_data),
			(SELECT id_recipient FROM recipient_data), $12, $13, $14, $15) 
			ON CONFLICT (reference, system_source) DO NOTHING
			RETURNING id_invoice
		),
		new_payment_status AS (
		INSERT INTO accounting.invoice_status_history
			(id_invoice, id_invoice_status)
			SELECT id_invoice, 5 
    		FROM new_invoice
		),
		new_sync_status AS (
		INSERT INTO accounting.invoice_sync_history (id_invoice, id_sync_status)
			SELECT id_invoice, 1 
    		FROM new_invoice
		)

		INSERT INTO accounting.invoice_detail
			(id_invoice, id_item, label, description, unit_price_tax_excl, discount, 
			unit_price_tax_excl_discount, unit_price_tax_incl, vat_rate, total_price_tax_excl, 
			total_price_tax_incl, quantity)
		SELECT 
			new_invoice.id_invoice,
			items.id,
			items.label,
			items.description,
			items.unit_price_tax_excl,
			items.discount,
			items.unit_price_tax_excl_discount,
			items.unit_price_tax_incl,
			items.vat_rate,
			items.total_price_tax_excl,
			items.total_price_tax_incl,
			items.quantity
		FROM new_invoice
		CROSS JOIN jsonb_to_recordset($16::jsonb) AS items(
			id VARCHAR(255),
			label VARCHAR(255),
			description TEXT,
			quantity INT,
			unit_price_tax_excl INT,
			discount JSONB ,
			unit_price_tax_excl_discount INT,
			unit_price_tax_incl INT,
			vat_rate INT,
			total_price_tax_excl INT,
			total_price_tax_incl INT
		);`;

		const result = await this.dbService.execute<{ id_invoice: number }>(
			sqlRequest,
			[
				data.source_system,
				data.reference,
				data.id_technical,
				data.total_amount_tax_excl,
				data.vat_amount,
				data.total_amount_tax_incl,
				data.issue_date,
				data.due_date,
				data.paid_at,
				data.emitter.id,
				data.recipient.id,
				data.currency,
				data.payment_direction,
				data.document_type,
				data.id_order,
				items,
			],
			'standard',
		);
		return result.length > 0 ? result[0].id_invoice : null;
	}

	findOne(id: string): Promise<IMcitysInvoice | null> {
		const query = `
			WITH main_invoice_data AS (
				SELECT
					ai.id_technical_erp AS id_technical,
					ai.reference AS reference,
					ai.id_order AS id_order,
					ai.source_system AS source_system,
					ai.invoice_type AS invoice_type,
					ai.issue_date AS issue_date,
					ai.due_date AS due_date,
					ai.paid_at AS paid_at,
					ai.emitter AS emitter,
					ai.recipient AS recipient,
					ai.currency AS currency,
					ai.amount_wt AS total_amount_tax_excl,
					ai.amount_at AS	total_amount_tax_incl,
					ai.amount_vat AS vat_amount,
					ai.payment_direction AS payment_direction,
					ai.id_contact AS id_contact
				FROM accounting.invoice ai
				WHERE ai.id_invoice = $1
			),

			emitter_data AS (
				SELECT
					cp.id_public AS id,
					cpo.id_registration AS legal_number,
					cpo.legal_name AS company_name,
					( SELECT 
					 	cc.value
					 FROM
					 	content.contact cc
					 INNER JOIN
					 	main_invoice_data ON cc.id_contact = main_invoice_data.id_contact
					) AS email,
					json_build_object(
						SELECT
							tc.alpha_2_code AS alpha_2,
							tc.alpha_3_code AS alpha_3
						FROM
							taxonomy.country tc
						INNER JOIN
							content.people_organization_detail cpo
						ON tc.id_country = cpo.registration_country
						WHERE cpo.id_person = (SELECT recipient FROM main_invoice_data)
					) AS country_code
					FROM content.people cp
					INNER JOIN
						content.people_organization_detail cpo
					ON cp.id_person = cpo.id_person
			),
			recipient AS (
				SELECT
			),
			order_details AS (
				json_agg(
					json_build_object(
					SELECT
						aid.label AS label,
						aid.description AS description,
						aid.quantity AS quantity,
						aid.unit_price_tax_excl AS unit_price_tax_excl,
						aid.discount AS discount::jsonb,
						aid.unit_price_tax_excl_discount AS unit_price_tax_excl_discount,
						aid.unit_price_tax_incl AS unit_price_tax_incl,
						aid.vat_rate AS vat_rate,
						aid.total_price_tax_excl AS total_price_tax_excl,
						aid.total_price_tax_incl AS total_price_tax_incl
					FROM 
						accounting.invoice_detail aid
					INNER JOIN
						accounting.invoice ai
					ON ai.id_invoice = aid.id_invoice
					WHERE
						ai.id_public = $1

					)
				)
			)
		`;
	}
}

	recipient: z.object({
		id: z.uuidv7().nullable().optional(),
		id_source_system: z.string(),
		firstname: z.string(),
		lastname: z.string(),
		company_name: z.string().optional(),
		email: z.email(),
		legal_number: z.string().optional(),
		vat_number: z.string().optional(),
		country_code: z.string().length(2).default('FR'),
		billing_address: AddressSchema,
	}),